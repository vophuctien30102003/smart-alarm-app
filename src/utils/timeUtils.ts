import { addDays, format, isAfter, isBefore, setHours, setMilliseconds, setMinutes, setSeconds } from 'date-fns';
import { Alarm, WeekDay } from '../types/alarm';

export const formatTime = (date: Date): string => {
  return format(date, 'HH:mm');
};

export const formatTimeDisplay = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const minute = parseInt(minutes, 10);
  
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
};

export const parseTimeString = (timeString: string): { hours: number; minutes: number } => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return { hours, minutes };
};

export const getNextAlarmTime = (alarm: Alarm): Date | null => {
  if (!alarm.isEnabled) return null;

  const now = new Date();
  const { hours, minutes } = parseTimeString(alarm.time);
  
  if (alarm.repeatDays.length === 0) {
    const today = setMilliseconds(setSeconds(setMinutes(setHours(now, hours), minutes), 0), 0);
    
    if (isAfter(today, now)) {
      return today;
    } else {
      return addDays(today, 1);
    }
  }

  for (let i = 0; i < 7; i++) {
    const checkDate = addDays(now, i);
    const dayOfWeek = checkDate.getDay();
    
    if (alarm.repeatDays.includes(dayOfWeek as WeekDay)) {
      const alarmTime = setMilliseconds(
        setSeconds(
          setMinutes(
            setHours(checkDate, hours),
            minutes
          ),
          0
        ),
        0
      );
      
      if (i === 0 && isBefore(alarmTime, now)) {
        continue;
      }
      
      return alarmTime;
    }
  }

  return null;
};

export const isAlarmDue = (alarm: Alarm, tolerance: number = 60000): boolean => {
  const nextTime = getNextAlarmTime(alarm);
  if (!nextTime) return false;

  const now = new Date();
  const timeDiff = Math.abs(nextTime.getTime() - now.getTime());
  
  return timeDiff <= tolerance;
};

export const getWeekDayName = (day: WeekDay): string => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[day];
};

export const getWeekDayFullName = (day: WeekDay): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[day];
};

export const formatRepeatDays = (repeatDays: WeekDay[]): string => {
  if (repeatDays.length === 0) return 'Once';
  if (repeatDays.length === 7) return 'Everyday';
  
  const weekdays = [WeekDay.MONDAY, WeekDay.TUESDAY, WeekDay.WEDNESDAY, WeekDay.THURSDAY, WeekDay.FRIDAY];
  const weekends = [WeekDay.SATURDAY, WeekDay.SUNDAY];
  
  const isWeekdays = weekdays.every(day => repeatDays.includes(day)) && 
                   repeatDays.length === weekdays.length;
  const isWeekends = weekends.every(day => repeatDays.includes(day)) && 
                    repeatDays.length === weekends.length;
  
  if (isWeekdays) return 'Weekdays';
  if (isWeekends) return 'Weekends';
  
  const sortedDays = [...repeatDays].sort();
  return sortedDays.map(day => getWeekDayName(day)).join(', ');
};

export const generateAlarmId = (): string => {
  return `alarm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const calculateSnoozeTime = (snoozeMinutes: number): Date => {
  return addDays(new Date(), snoozeMinutes / (24 * 60));
};

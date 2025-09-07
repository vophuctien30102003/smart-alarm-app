import { addDays, format, isAfter, isBefore, setHours, setMilliseconds, setMinutes, setSeconds } from 'date-fns';
import { WeekDay } from '../prototype/enum/day.enum';
import { Alarm } from '../types/AlarmClock';

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

const mapJSDayToWeekDay = (jsDay: number): WeekDay => {
  const mapping: { [key: number]: WeekDay } = {
    0: WeekDay.SUNDAY,
    1: WeekDay.MONDAY,
    2: WeekDay.TUESDAY,
    3: WeekDay.WEDNESDAY,
    4: WeekDay.THURSDAY,
    5: WeekDay.FRIDAY,
    6: WeekDay.SATURDAY,
  };
  return mapping[jsDay];
};

const mapWeekDayToNumber = (day: WeekDay): number => {
  const mapping: { [key in WeekDay]: number } = {
    [WeekDay.SUNDAY]: 0,
    [WeekDay.MONDAY]: 1,
    [WeekDay.TUESDAY]: 2,
    [WeekDay.WEDNESDAY]: 3,
    [WeekDay.THURSDAY]: 4,
    [WeekDay.FRIDAY]: 5,
    [WeekDay.SATURDAY]: 6,
  };
  return mapping[day];
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
    const dayOfWeek = mapJSDayToWeekDay(checkDate.getDay());
    
    if (alarm.repeatDays.includes(dayOfWeek)) {
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

export const getWeekDayFullName = (day: WeekDay): string => {
  const days: { [key in WeekDay]: string } = {
    [WeekDay.SUNDAY]: 'Sunday',
    [WeekDay.MONDAY]: 'Monday',
    [WeekDay.TUESDAY]: 'Tuesday',
    [WeekDay.WEDNESDAY]: 'Wednesday',
    [WeekDay.THURSDAY]: 'Thursday',
    [WeekDay.FRIDAY]: 'Friday',
    [WeekDay.SATURDAY]: 'Saturday',
  };
  return days[day];
};

export const getWeekDayShortName = (day: WeekDay): string => {
  const days: { [key in WeekDay]: string } = {
    [WeekDay.SUNDAY]: 'Sun',
    [WeekDay.MONDAY]: 'Mon',
    [WeekDay.TUESDAY]: 'Tue',
    [WeekDay.WEDNESDAY]: 'Wed',
    [WeekDay.THURSDAY]: 'Thu',
    [WeekDay.FRIDAY]: 'Fri',
    [WeekDay.SATURDAY]: 'Sat',
  };
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
  
  const sortedDays = [...repeatDays].sort((a, b) => 
    mapWeekDayToNumber(a) - mapWeekDayToNumber(b)
  );
  return sortedDays.map(day => getWeekDayFullName(day)).join(', ');
};

export const generateAlarmId = (): string => {
  return `alarm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const calculateSnoozeTime = (snoozeMinutes: number): Date => {
  return addDays(new Date(), snoozeMinutes / (24 * 60));
};

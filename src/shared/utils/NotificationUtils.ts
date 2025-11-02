import * as Notifications from "expo-notifications";
import { WeekDay } from "../enums";
import { TimeAlarm } from "../types/alarm.type";
const ALARM_CHANNEL_ID = "alarms";
export class NotificationUtils {
    static calculateNextTriggerDate(alarm: TimeAlarm): Date | null {
        if (!alarm.time || !alarm.time.includes(":")) {
            console.error("Invalid time format:", alarm.time);
            return null;
        }
        const [hours, minutes] = alarm.time.split(":").map(Number);
        if (isNaN(hours) || isNaN(minutes)) {
            console.error("Invalid time format:", alarm.time);
            return null;
        }
        const now = new Date();
        let triggerDate = new Date();
        triggerDate.setHours(hours, minutes, 0, 0);
        if (triggerDate <= now) {
            if (alarm.repeatDays && alarm.repeatDays.length > 0) {
                return this.getNextRepeatDate(alarm, triggerDate);
            } else {
                triggerDate.setDate(triggerDate.getDate() + 1);
            }
        }
        return triggerDate;
    }
    static getNextDateForTime(time: string, reference: Date = new Date()): Date {
        const { hours, minutes } = this.parseTimeString(time);
        const candidate = new Date(reference);
        candidate.setHours(hours, minutes, 0, 0);
        if (candidate <= reference) {
            candidate.setDate(candidate.getDate() + 1);
        }
        return candidate;
    }
    static parseTimeString(time: string): { hours: number; minutes: number } {
        const [hours, minutes] = time.split(":").map(Number);
        return { hours, minutes };
    }
    static createWeeklyTrigger(day: WeekDay, hour: number, minute: number): Notifications.WeeklyTriggerInput {
        return {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            channelId: ALARM_CHANNEL_ID,
            weekday: this.mapWeekDayToCalendar(day),
            hour,
            minute,
        };
    }
    static mapWeekDayToCalendar(day: WeekDay): number {
        const mapping: Record<WeekDay, number> = {
            [WeekDay.SUNDAY]: 1,
            [WeekDay.MONDAY]: 2,
            [WeekDay.TUESDAY]: 3,
            [WeekDay.WEDNESDAY]: 4,
            [WeekDay.THURSDAY]: 5,
            [WeekDay.FRIDAY]: 6,
            [WeekDay.SATURDAY]: 7,
        };
        return mapping[day] || 1;
    }
    static getNextWeekDay(day: WeekDay): WeekDay {
        return day === WeekDay.SATURDAY ? WeekDay.SUNDAY : (day + 1) as WeekDay;
    }
    private static getNextRepeatDate(alarm: TimeAlarm, baseDate: Date): Date {
        const now = new Date();
        const repeatDaysAsNumbers = alarm.repeatDays?.map(weekDay => weekDay === WeekDay.SUNDAY ? 0 : weekDay) || [];
        for (let i = 0; i < 7; i++) {
            const testDate = new Date(baseDate);
            testDate.setDate(testDate.getDate() + i);
            const testDay = testDate.getDay();
            if (repeatDaysAsNumbers.includes(testDay)) {
                if (i === 0 && testDate > now) return testDate;
                if (i > 0) return testDate;
            }
        }
        const nextDate = new Date(baseDate);
        nextDate.setDate(nextDate.getDate() + 7);
        return nextDate;
    }
}
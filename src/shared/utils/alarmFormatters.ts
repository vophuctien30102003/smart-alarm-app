import type { WeekDay } from '@/shared/enums';
import { AlarmType } from '@/shared/enums';
import type { Alarm } from '@/shared/types/alarm.type';
import { formatRepeatDays } from '@/shared/utils/timeUtils';

interface LabelOptions {
  label?: string;
  type: AlarmType;
  repeatDays?: WeekDay[];
}

export const formatAlarmLabel = ({ label, type, repeatDays }: LabelOptions): string => {
  const trimmed = (label ?? '').trim();
  if (trimmed.length > 0) {
    return trimmed;
  }

  if (type === AlarmType.SLEEP || type === AlarmType.TIME) {
    if (repeatDays && repeatDays.length > 0) {
      return formatRepeatDays(repeatDays);
    }
    return type === AlarmType.SLEEP ? 'Sleep schedule' : 'Alarm';
  }

  return 'Location alarm';
};

export const formatAlarmRepeatDescription = (alarm: Alarm): string => {
  if ('repeatDays' in alarm && alarm.repeatDays.length > 0) {
    return formatRepeatDays(alarm.repeatDays);
  }

  return 'Once';
};

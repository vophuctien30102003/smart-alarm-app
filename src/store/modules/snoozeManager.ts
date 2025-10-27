import type { Alarm } from '@/shared/types/alarm.type';

const SNOOZE_TIMEOUT_KEY = 'snoozeTimeout';

type GlobalWithSnooze = typeof globalThis & {
  [SNOOZE_TIMEOUT_KEY]?: ReturnType<typeof setTimeout>;
};

const getGlobal = (): GlobalWithSnooze => globalThis as GlobalWithSnooze;

export const clearSnoozeTimeout = () => {
  const globalRef = getGlobal();
  const existingTimeout = globalRef[SNOOZE_TIMEOUT_KEY];
  if (existingTimeout) {
    clearTimeout(existingTimeout);
    delete globalRef[SNOOZE_TIMEOUT_KEY];
  }
};

export const scheduleSnoozeTimeout = (
  alarm: Alarm,
  minutes: number,
  trigger: (alarm: Alarm) => void,
) => {
  clearSnoozeTimeout();
  const timeout = setTimeout(() => {
    trigger(alarm);
  }, minutes * 60 * 1000);
  getGlobal()[SNOOZE_TIMEOUT_KEY] = timeout;
};

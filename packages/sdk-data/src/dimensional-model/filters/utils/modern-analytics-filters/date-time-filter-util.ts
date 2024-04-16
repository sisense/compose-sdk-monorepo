import { DatetimeLevel } from './types.js';
export const getCorrectTimeLevel = (level?: DatetimeLevel, bucket?: string): DatetimeLevel => {
  let newLevel = level ? (level.toLocaleLowerCase() as DatetimeLevel) : DatetimeLevel.YEARS;

  if (newLevel === DatetimeLevel.MINUTES && bucket === '60') {
    newLevel = DatetimeLevel.HOURS;
  }

  return newLevel;
};

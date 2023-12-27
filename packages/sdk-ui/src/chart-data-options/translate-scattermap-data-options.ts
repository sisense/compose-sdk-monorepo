import {
  ScattermapChartDataOptions,
  ScattermapChartDataOptionsInternal,
  ScattermapColumn,
  ScattermapLocationLevel,
} from './types';
import {
  translateColumnToCategory,
  translateColumnToValue,
  translateColumnToCategoryOrValue,
} from './utils';

const locationLevelPriorityMap = {
  city: 4,
  state: 3,
  country: 2,
  auto: 1,
} as const;

export function getLocationLevel(locationDataOptions: ScattermapChartDataOptions['locations']) {
  const locationLevels = locationDataOptions
    .filter((option) => 'level' in option && option.level)
    .map((option) => (option as ScattermapColumn).level);

  return locationLevels.reduce(
    (selectedLevel: ScattermapLocationLevel, level: ScattermapLocationLevel) => {
      if (locationLevelPriorityMap[level] > locationLevelPriorityMap[selectedLevel]) {
        return level;
      }
      return selectedLevel;
    },
    'auto',
  );
}

export function translateScattermapChartDataOptions(
  scattermap: ScattermapChartDataOptions,
): ScattermapChartDataOptionsInternal {
  const { locations, size, colorBy, details } = scattermap;

  return {
    locations: locations && locations.map(translateColumnToCategory),
    size: size && translateColumnToValue(size),
    colorBy: colorBy && translateColumnToValue(colorBy),
    details: details && translateColumnToCategoryOrValue(details),
    locationLevel: getLocationLevel(locations),
  } as ScattermapChartDataOptionsInternal;
}

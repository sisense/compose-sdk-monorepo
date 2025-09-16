import {
  ScattermapChartDataOptions,
  ScattermapChartDataOptionsInternal,
  ScattermapLocationLevel,
  StyledColumn,
} from './types';
import { normalizeColumn, normalizeMeasureColumn, normalizeAnyColumn } from './utils';

const locationLevelPriorityMap = {
  city: 4,
  state: 3,
  country: 2,
  auto: 1,
} as const;

export function getLocationLevel(locationDataOptions: ScattermapChartDataOptions['geo']) {
  const locationLevels = locationDataOptions
    .filter((option) => 'geoLevel' in option && option.geoLevel)
    .map((option) => (option as StyledColumn).geoLevel as ScattermapLocationLevel);

  return locationLevels.reduce((selectedLevel: ScattermapLocationLevel, level) => {
    if (locationLevelPriorityMap[level] > locationLevelPriorityMap[selectedLevel]) {
      return level;
    }
    return selectedLevel;
  }, 'auto');
}

export function translateScattermapChartDataOptions(
  scattermap: ScattermapChartDataOptions,
): ScattermapChartDataOptionsInternal {
  const { geo, size, colorBy, details } = scattermap;
  return {
    locations: geo.map((c) => normalizeColumn(c)),
    size: size && normalizeMeasureColumn(size),
    colorBy: colorBy && normalizeMeasureColumn(colorBy),
    details: details && normalizeAnyColumn(details),
    locationLevel: getLocationLevel(geo),
  };
}

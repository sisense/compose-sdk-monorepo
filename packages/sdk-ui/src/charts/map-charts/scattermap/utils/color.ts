import { createDataColoringFunction } from '../../../../chart-data/data-coloring/create-data-coloring-function.js';
import { ScattermapChartLocation } from '../../../../chart-data/types.js';
import { DataColorOptions } from '../../../../types.js';

const DEFAULT_COLOR = '#00cee6';

type LocationColor = {
  colorValue?: number;
  color?: string;
};

const seriesColoringFunction = createDataColoringFunction({
  getValueFromDataStructure: ({ colorValue }: LocationColor) => parseFloat(`${colorValue}`),
  applyColorToDataStructure: (obj: LocationColor, color?: string) => ({ ...obj, color }),
});

export function getLocationsMarkerColors(
  locations: ScattermapChartLocation[],
  colorOptions?: DataColorOptions,
) {
  if (!colorOptions) {
    return locations.map(() => DEFAULT_COLOR);
  }

  return seriesColoringFunction(
    locations.map(({ colorValue }) => ({ colorValue })),
    colorOptions,
  ).map(({ color }) => color) as string[];
}

import {
  ColoringService,
  getColoringServiceByColorOptions,
} from '../../chart-data-options/coloring';
import { SeriesValueData } from '../types';
import { DataColorOptions } from './types';

export function seriesDataColorService(
  seriesValues: SeriesValueData[],
  colorOpts: DataColorOptions,
): SeriesValueData[] {
  const getValueFromSeries = (seriesValue: SeriesValueData) => seriesValue.value;
  const applyColorToSeries = (seriesValue: SeriesValueData, color: string | undefined) => ({
    ...seriesValue,
    color,
  });
  return generateColorsForDataStructures(
    seriesValues,
    colorOpts,
    getValueFromSeries,
    applyColorToSeries,
  );
}

// eslint-disable-next-line max-params
export function generateColorsForDataStructures<DataStructure extends {}>(
  dataStructures: DataStructure[],
  colorOpts: DataColorOptions,
  getValueFromDataStructure: (data: DataStructure) => number,
  applyColorToDataStructure: (data: DataStructure, color: string | undefined) => DataStructure,
) {
  const coloringService = getColoringServiceByColorOptions(colorOpts);

  // Define a function that generates color for a single value.
  // It allows us to iterate over 'dataStructures' array only ones.
  let generateColor: (value: number) => string | undefined;

  // create 'generateColor' function based on the type of the coloring service.
  switch (coloringService.type) {
    case 'Static':
      generateColor = () => (coloringService as ColoringService<'Static'>).getColor();
      break;
    case 'Absolute':
      generateColor = (value) => (coloringService as ColoringService<'Absolute'>).getColor(value);
      break;
    case 'Relative': {
      const allValues = dataStructures.map(getValueFromDataStructure);
      const getColorForSingleValue = (coloringService as ColoringService<'Relative'>).getColor(
        allValues,
      );
      generateColor = (value) => getColorForSingleValue(value);
      break;
    }
  }

  return dataStructures.map((item) => {
    const value = getValueFromDataStructure(item);
    const color = generateColor(value);
    return applyColorToDataStructure(item, color);
  });
}

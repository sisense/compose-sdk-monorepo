import {
  ColoringService,
  getColoringServiceByColorOptions,
} from '../../chart-data-options/coloring';
import { DataColorOptions } from './types.js';

export type DataStructureOperator<DataStructure extends {}, ColoredDataStructure extends {}> = {
  getValueFromDataStructure: (data: DataStructure) => number;
  applyColorToDataStructure: (data: DataStructure, color?: string) => ColoredDataStructure;
};

export type ColoringFunction<DataStructure extends {}, ColoredDataStructure extends {}> = (
  dataStructures: DataStructure[],
  colorOpts: DataColorOptions,
) => ColoredDataStructure[];

export const createDataColoringFunction = <
  DataStructure extends {},
  ColoredDataStructure extends {},
>(
  dsOperator: DataStructureOperator<DataStructure, ColoredDataStructure>,
): ColoringFunction<DataStructure, ColoredDataStructure> => {
  const { getValueFromDataStructure, applyColorToDataStructure } = dsOperator;

  return (dataStructures, colorOpts) => {
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
  };
};

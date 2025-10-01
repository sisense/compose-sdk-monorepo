import { NOT_AVAILABLE_DATA_VALUE } from '@/const.js';
import { ScattermapChartDataOptionsInternal } from '../chart-data-options/types.js';
import {
  Column,
  DataTable,
  getColumnByName,
  getColumnsByName,
  getValue,
  isBlurred,
} from '../chart-data-processor/table-processor.js';
import { combineLocationNames } from '../charts/map-charts/scattermap/utils/location.js';
import { ScattermapChartData } from './types.js';
import { isNumber } from '@ethings-os/sdk-data';

const LOCATION_DEFAULT_VALUE = 1;

export const scattermapData = (
  dataOptions: ScattermapChartDataOptionsInternal,
  dataTable: DataTable,
): ScattermapChartData => {
  const isLatLngCase = checkForScattermapLatLngCase(dataOptions);
  const locationColumns: Column[] =
    dataOptions.locations &&
    getColumnsByName(
      dataTable,
      dataOptions.locations.map(({ column: { name } }) => name),
    );
  const sizeColumn = dataOptions.size && getColumnByName(dataTable, dataOptions.size.column.name);
  const colorByColumn =
    dataOptions.colorBy && getColumnByName(dataTable, dataOptions.colorBy.column.name);
  const detailsColumn =
    dataOptions.details && getColumnByName(dataTable, dataOptions.details.column.name);

  const locations = dataTable.rows
    .filter((row) => {
      return locationColumns.some(
        (column) => (getValue(row, column) as string) !== NOT_AVAILABLE_DATA_VALUE,
      );
    })
    .map((row) => {
      const rawName = locationColumns.map((column) => getValue(row, column) as string);
      const name = combineLocationNames(rawName);

      let coordinates;
      if (isLatLngCase) {
        coordinates = {
          lat: getValue(row, locationColumns[0]) as number,
          lng: getValue(row, locationColumns[1]) as number,
        };
      }

      const blur = locationColumns[0] && !!isBlurred(row, locationColumns[0]);
      return {
        name,
        rawName,
        value: sizeColumn ? (getValue(row, sizeColumn) as number) : LOCATION_DEFAULT_VALUE,
        ...(colorByColumn && { colorValue: getValue(row, colorByColumn) as number }),
        ...(detailsColumn && { details: getValue(row, detailsColumn) as number }),
        blur,
        ...(coordinates ? { coordinates } : null),
      };
    });

  return {
    type: 'scattermap',
    locations,
  };
};

function checkForScattermapLatLngCase(chartDataOptions: ScattermapChartDataOptionsInternal) {
  return (
    chartDataOptions.locations.length === 2 &&
    chartDataOptions.locations.filter(({ column: { type } }) => isNumber(type)).length === 2
  );
}

import { useCallback } from 'react';
import delay from 'lodash-es/delay';
import { ScattermapChartLocation } from '../../../../chart-data/types';
import { useSisenseContext } from '../../../../sisense-context/sisense-context.js';
import {
  ScattermapChartDataOptionsInternal,
  isMeasureColumn,
} from '../../../../chart-data-options/types.js';
import { QueryDescription, executeQuery } from '../../../../query/execute-query.js';
import { DataSource, Filter, filterFactory } from '@sisense/sdk-data';
import { mergeFilters } from '../../../../dashboard-widget/utils.js';
import { translateCategoryToAttribute } from '../../../../chart-data-options/utils.js';
import { TooltipShowDetails, createScattermapTooltip } from '../utils/tooltip';
import { splitLocationName } from '../utils/location';

const TOOLTIP_DETAILS_LOADING_MINIMAL_DELAY = 600;
const TOOLTIP_DETAILS_QUERY_COUNT = 11;

export type TooltipOptions = {
  content: string;
  postponedContent?: Promise<string>;
};

type TooltipHandler = (location: ScattermapChartLocation) => TooltipOptions;

export const useTooltipHandler = ({
  dataOptions,
  dataSource,
  filters = [],
}: {
  dataOptions: ScattermapChartDataOptionsInternal;
  dataSource: DataSource | null;
  filters?: Filter[];
}): TooltipHandler => {
  const { app } = useSisenseContext();

  const loadTooltipDetails = useCallback(
    async (locationName: ScattermapChartLocation['name']) => {
      if (!app) return [];

      const locationFilters = dataOptions.locations.map((locationDataOption, index) => {
        const attribute = translateCategoryToAttribute(locationDataOption);
        const locationValue = splitLocationName(locationName)[index];
        return filterFactory.members(attribute, [locationValue]);
      });

      const detailsQuery: QueryDescription = {
        dataSource,
        dimensions: [dataOptions.details],
        filters: mergeFilters(filters, locationFilters),
        count: TOOLTIP_DETAILS_QUERY_COUNT,
      } as QueryDescription;
      const detailsData = await executeQuery(detailsQuery, app);

      return detailsData.rows.map(([cell]) => cell.text);
    },
    [app, dataOptions, dataSource, filters],
  );

  const tooltipHandler: TooltipHandler = useCallback(
    (location) => {
      // handles case with no "details"
      if (
        !dataOptions.details ||
        (dataOptions.details && !isMeasureColumn(dataOptions.details) && !dataSource)
      ) {
        return {
          content: createScattermapTooltip(location, dataOptions),
        };
      }

      // handles case with already available measure "details"
      if (isMeasureColumn(dataOptions.details)) {
        return {
          content: createScattermapTooltip(location, dataOptions, TooltipShowDetails.YES),
        };
      }

      // handles case with fetching "details" data
      const delayPromise = new Promise((resolve) =>
        delay(resolve, TOOLTIP_DETAILS_LOADING_MINIMAL_DELAY),
      );
      const postponedContent = Promise.all([loadTooltipDetails(location.name), delayPromise]).then(
        ([detailsItems]) =>
          createScattermapTooltip(
            { ...location, details: detailsItems as string[] },
            dataOptions,
            TooltipShowDetails.YES,
          ),
      );
      return {
        content: createScattermapTooltip(location, dataOptions, TooltipShowDetails.LOADING),
        postponedContent,
      };
    },
    [dataOptions, dataSource, loadTooltipDetails],
  );

  return tooltipHandler;
};

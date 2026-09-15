import { isForecastMeasure, isMeasureInstance, isTrendMeasure, Measure } from '@sisense/sdk-data';

import { adaptMeasuresForQuery } from './apply-styled-options-to-query.js';
import type {
  DerivedResultColumn,
  StyledColumn,
  StyledMeasureColumn,
  TableDataOptionsInternal,
} from './types.js';
import { getDataOptionTitle, isDerivedResultColumn, isMeasureColumn } from './utils.js';

/**
 * Appends `Trend`/`Forecast` companion measure columns for every measure column that carries
 * `.trend`/`.forecast`, reusing {@link adaptMeasuresForQuery} — the same trend/forecast
 * synthesis the narrative path already uses — so Table doesn't grow a second, parallel
 * `measureFactory.trend`/`.forecast` construction.
 *
 * A measure column whose underlying `column` is not a real dimensional measure (e.g. a plain
 * Fusion `MeasureColumn` DTO) is left untouched — `measureFactory.trend`/`.forecast` require a
 * dimensional {@link Measure}.
 *
 * @internal
 */
export function withTrendForecastColumns(
  dataOptions: Readonly<TableDataOptionsInternal>,
): TableDataOptionsInternal {
  const columns = dataOptions.columns.flatMap(
    (col): (StyledColumn | StyledMeasureColumn | DerivedResultColumn)[] => {
      if (isDerivedResultColumn(col) || !isMeasureColumn(col)) {
        return [col];
      }

      const { column, trend, forecast, ...restStyle } = col;

      if ((!trend && !forecast) || !isMeasureInstance(column)) {
        return [col];
      }

      const baseTitle = getDataOptionTitle(col);
      const [base, ...companions]: Measure[] = adaptMeasuresForQuery([
        { measure: column, style: { trend, forecast } },
      ]);

      // Selected by kind, not position — adaptMeasuresForQuery's companion order is an
      // implementation detail, and it also skips a companion when `column` is already that
      // kind of measure.
      const companionsByLabel: [label: string, companion: Measure | undefined][] = [
        ['Trend', trend ? companions.find(isTrendMeasure) : undefined],
        ['Forecast', forecast ? companions.find(isForecastMeasure) : undefined],
      ];

      return [
        { ...restStyle, column: base },
        ...companionsByLabel
          .filter((entry): entry is [string, Measure] => entry[1] !== undefined)
          .map(([label, companion]) => ({
            column: companion,
            numberFormatConfig: restStyle.numberFormatConfig,
            name: `${baseTitle} ${label}`,
          })),
      ];
    },
  );

  return { columns };
}

/**
 * Appends `DerivedResultColumn` entries for the confidence-interval bounds the backend returns
 * unrequested alongside a forecast measure (see `measureFactory.forecast`'s own doc comment),
 * suffixed `_upper`/`_lower` on the (possibly alias-renamed) forecast measure's name.
 *
 * Must run *after* any measure-name aliasing (e.g. `withUniqueMeasureNames`) — the expected
 * response header is built from the measure's name at that point, whatever it is.
 *
 * @internal
 */
export function withForecastRangeColumns(
  dataOptions: Readonly<TableDataOptionsInternal>,
): TableDataOptionsInternal {
  const columns = dataOptions.columns.flatMap(
    (col): (StyledColumn | StyledMeasureColumn | DerivedResultColumn)[] => {
      if (
        isDerivedResultColumn(col) ||
        !isMeasureColumn(col) ||
        !isMeasureInstance(col.column) ||
        !isForecastMeasure(col.column)
      ) {
        return [col];
      }

      const friendlyTitle = getDataOptionTitle(col);
      return [
        col,
        {
          name: `${col.column.name}_upper`,
          title: `${friendlyTitle} Upper Bound`,
          numberFormatConfig: col.numberFormatConfig,
        },
        {
          name: `${col.column.name}_lower`,
          title: `${friendlyTitle} Lower Bound`,
          numberFormatConfig: col.numberFormatConfig,
        },
      ];
    },
  );

  return { columns };
}

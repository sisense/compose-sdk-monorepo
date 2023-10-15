import { Attribute, Measure, Filter, MetadataTypes } from '@sisense/sdk-data';
import type { ExecuteQueryParams } from './index';
import { createDimensionalElementFromJaql } from '../dashboard-widget/translate-widget-data-options';
import { getRootPanelItem } from '../dashboard-widget/utils';
import type { WidgetDto } from '../dashboard-widget/types';

/**
 * Extracts query parameters from a widget object.
 *
 * @param {WidgetDto} widget - The widget from which to extract query parameters.
 * @returns {ExecuteQueryParams} An object containing extracted query parameters.
 */
export function extractQueryFromWidget(widget: WidgetDto): ExecuteQueryParams {
  const { panels } = widget.metadata;
  const dataSource = widget.datasource.title;
  const measures: Measure[] = [];
  const dimensions: Attribute[] = [];
  const filters: Filter[] = [];

  panels.forEach((panel) => {
    panel?.items
      ?.filter((item) => !item.disabled)
      .forEach((item) => {
        const root = getRootPanelItem(item);
        const element = createDimensionalElementFromJaql(root.jaql, root.format);

        if (MetadataTypes.isFilter(element)) {
          filters.push(element as Filter);
        } else if (MetadataTypes.isMeasure(element)) {
          measures.push(element as Measure);
        } else {
          dimensions.push(element as Attribute);
        }
      });
  });

  return {
    dataSource,
    measures,
    dimensions,
    filters,
    highlights: [],
  };
}

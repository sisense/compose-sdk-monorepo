import { createFilterMatcher } from '@sisense/sdk-data';
import { type JaqlPanel, type JaqlRequest, UserType } from '@sisense/sdk-pivot-query-client';
import { type PivotTreeNode } from '@sisense/sdk-pivot-ui';

import type { HeaderCellFormatter } from '../types.js';

export const createHeaderCellHighlightFormatter = (): HeaderCellFormatter => {
  return (cell: PivotTreeNode, jaqlPanelItem: JaqlPanel | undefined, jaql: JaqlRequest) => {
    const isCorner = cell.userType === UserType.CORNER;
    const isSubTotal = cell.userType === UserType.SUB_TOTAL;
    // a measure header shows the measure title, never a member of the highlighted dimension, so it
    // is skipped the same way `createHeaderCellValueFormatter` skips it
    const isMeasureHeader = jaqlPanelItem?.panel === 'measures';

    if (!jaqlPanelItem || isCorner || isSubTotal || isMeasureHeader) {
      return;
    }

    const jaqlPanelItemWithHighlightFilter = jaql.metadata.find(({ panel, jaql }) => {
      const isPanelSupportHighlighting = ['rows', 'columns'].includes(panel);
      const hasSameDimension = jaql.dim === jaqlPanelItem.jaql.dim;
      const hasSameDatatype =
        jaqlPanelItem.jaql.datatype === jaql.datatype && jaqlPanelItem.jaql.level === jaql.level;
      const hasHighlightFilter = jaql.in?.selected;
      return (
        isPanelSupportHighlighting && hasSameDimension && hasSameDatatype && hasHighlightFilter
      );
    });

    const highlightFilter = jaqlPanelItemWithHighlightFilter?.jaql?.in?.selected;

    if (!highlightFilter) {
      return;
    }

    const filterMatcher = createFilterMatcher(highlightFilter.jaql);
    const isSelected = filterMatcher(cell.value);

    if (isSelected) {
      cell.state = {
        isSelected: true,
      };
    }
  };
};

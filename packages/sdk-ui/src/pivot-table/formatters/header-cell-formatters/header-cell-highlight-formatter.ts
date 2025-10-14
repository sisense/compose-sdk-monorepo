import { createFilterMatcher } from '@sisense/sdk-data';
import {
  type JaqlPanel,
  type JaqlRequest,
  type PivotTreeNode,
  UserType,
} from '@sisense/sdk-pivot-client';

import type { HeaderCellFormatter } from '../types.js';

export const createHeaderCellHighlightFormatter = (): HeaderCellFormatter => {
  return (cell: PivotTreeNode, jaqlPanelItem: JaqlPanel | undefined, jaql: JaqlRequest) => {
    const isCorner = cell.userType === UserType.CORNER;
    const isSubTotal = cell.userType === UserType.SUB_TOTAL;

    if (!jaqlPanelItem || isCorner || isSubTotal) {
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

import type { TFunction } from '@sisense/sdk-common';
import { isFilterRelations } from '@sisense/sdk-data';
import type { Filter, FilterRelations, FilterRelationsNode } from '@sisense/sdk-data';

import { FILTER_CHIP_SEPARATOR } from './filter-to-readable-label';
import { getAttributeLabel, getFilterLabel, getMeasureLabel } from './query-params-to-view-model';
import type {
  GroupedTooltipLine,
  QueryDefinitionCustomPill,
  QueryDefinitionViewModel,
  QueryPillItem,
  RelationsTooltipNode,
} from './types';
import { isConnectorItem, isPillItem } from './types';

type CustomFilterValue = Filter | readonly Filter[] | FilterRelations;

function isFilterList(value: CustomFilterValue): value is readonly Filter[] {
  return Array.isArray(value);
}

function isFilterRelationsValue(value: Filter | FilterRelations): value is FilterRelations {
  return 'left' in value && isFilterRelations(value);
}

function toGroupedTooltipLine(filter: Filter, t?: TFunction): GroupedTooltipLine | undefined {
  const fullLabel = getFilterLabel(filter, t);
  if (!fullLabel) {
    return undefined;
  }
  const column = filter.attribute ? getAttributeLabel(filter.attribute, t) : fullLabel;
  const prefix = `${column}${FILTER_CHIP_SEPARATOR}`;
  if (fullLabel.startsWith(prefix)) {
    return { column, value: fullLabel.slice(prefix.length) };
  }
  return { column, value: fullLabel === column ? '' : fullLabel };
}

function toRelationsGroup(
  operator: 'AND' | 'OR',
  nodes: readonly (RelationsTooltipNode | undefined)[],
): RelationsTooltipNode | undefined {
  const items = nodes.flatMap((node) => {
    if (!node) {
      return [];
    }
    // Same-operator chains read as one flat list: (A OR B) OR C → A OR B OR C.
    return 'operator' in node && node.operator === operator ? node.items : [node];
  });
  if (items.length <= 1) {
    return items[0];
  }
  return { operator, items };
}

function toRelationsTooltip(
  node: FilterRelationsNode,
  t?: TFunction,
): RelationsTooltipNode | undefined {
  if (Array.isArray(node)) {
    return toRelationsGroup(
      'AND',
      node.map((filter) => toGroupedTooltipLine(filter, t)),
    );
  }
  if ('left' in node) {
    return toRelationsGroup(node.operator, [
      toRelationsTooltip(node.left, t),
      toRelationsTooltip(node.right, t),
    ]);
  }
  return toGroupedTooltipLine(node, t);
}

function withPresentation(
  pill: QueryDefinitionCustomPill,
  item: Omit<QueryPillItem, 'pin' | 'color'>,
): QueryPillItem {
  return {
    ...item,
    color: pill.color,
    pin: pill.pin !== false,
  };
}

function customPillToViewModelItems(
  pill: QueryDefinitionCustomPill,
  index: number,
  t?: TFunction,
): QueryDefinitionViewModel {
  if (pill.category === 'filter') {
    if (isFilterList(pill.value)) {
      if (pill.value.length === 0 || !pill.label) {
        return [];
      }
      const groupedTooltipLines = pill.value.flatMap((filter) => {
        const line = toGroupedTooltipLine(filter, t);
        return line ? [line] : [];
      });
      return [
        withPresentation(pill, {
          type: 'pill',
          label: pill.label,
          category: 'filter',
          id: `custom-filter-${index}-${pill.label}`,
          groupedTooltipLines,
        }),
      ];
    }
    if (isFilterRelationsValue(pill.value)) {
      if (!pill.label) {
        return [];
      }
      return [
        withPresentation(pill, {
          type: 'pill',
          label: pill.label,
          category: 'filter',
          id: `custom-filter-${index}-${pill.label}`,
          tooltipData: pill.value,
          relationsTooltip: toRelationsTooltip(pill.value, t),
        }),
      ];
    }
    const label = pill.label ?? getFilterLabel(pill.value, t);
    if (!label) {
      return [];
    }
    return [
      withPresentation(pill, {
        type: 'pill',
        label,
        category: 'filter',
        id: `custom-filter-${index}-${label}`,
        tooltipData: pill.value,
      }),
    ];
  }

  if (pill.category === 'measure') {
    const label = pill.label ?? getMeasureLabel(pill.value, t);
    return [
      withPresentation(pill, {
        type: 'pill',
        label,
        category: 'measure',
        id: `custom-measure-${index}-${label}`,
        tooltipData: pill.value,
      }),
    ];
  }

  const label = pill.label ?? getAttributeLabel(pill.value, t);
  return [
    withPresentation(pill, {
      type: 'pill',
      label,
      category: 'dimension',
      id: `custom-dimension-${index}-${label}`,
      tooltipData: pill.value,
    }),
  ];
}

/**
 * Converts host {@link QueryDefinitionCustomPill} entries to view-model pills (no connectors).
 * Empty filter groups, empty relation labels, and filters with no readable label are omitted.
 * A {@link FilterRelations} value stays one pill; hover shows its filters joined by AND/OR.
 *
 * @param customPills - Host-owned pills appended after query-derived chips.
 * @param t - Optional i18n translate function for date-level attribute labels.
 * @returns View-model pills in input order, excluding omitted entries.
 * @internal
 */
export function customPillsToViewModel(
  customPills: readonly QueryDefinitionCustomPill[] | undefined,
  t?: TFunction,
): QueryDefinitionViewModel {
  if (!customPills?.length) {
    return [];
  }
  return customPills.flatMap((pill, index) => customPillToViewModelItems(pill, index, t));
}

function isMeasureOrDimensionPill(item: QueryDefinitionViewModel[number]): boolean {
  return isPillItem(item) && (item.category === 'measure' || item.category === 'dimension');
}

/**
 * Appends custom-pill items after the query-derived view model. Filter custom pills follow the
 * query-filter grammar: when measures or dimensions precede them and the query added no "where"
 * of its own, a "where" connector goes before the first one. A filters-only row gets none.
 *
 * @param baseItems - View model derived from the query.
 * @param customItems - View model of the host's custom pills.
 * @returns The combined view model.
 * @internal
 */
export function appendCustomPills(
  baseItems: QueryDefinitionViewModel,
  customItems: QueryDefinitionViewModel,
): QueryDefinitionViewModel {
  const firstFilterIndex = customItems.findIndex(
    (item) => isPillItem(item) && item.category === 'filter',
  );
  const itemsBefore = [...baseItems, ...customItems.slice(0, Math.max(firstFilterIndex, 0))];
  const needsWhere =
    firstFilterIndex !== -1 &&
    itemsBefore.some(isMeasureOrDimensionPill) &&
    !baseItems.some((item) => isConnectorItem(item) && item.label === 'where');
  if (!needsWhere) {
    return [...baseItems, ...customItems];
  }
  return [
    ...baseItems,
    ...customItems.slice(0, firstFilterIndex),
    { type: 'connector', label: 'where' },
    ...customItems.slice(firstFilterIndex),
  ];
}

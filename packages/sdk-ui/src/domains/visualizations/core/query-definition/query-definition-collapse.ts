import { type ConnectorItem, isPillItem, type QueryDefinitionViewModel } from './types';

/**
 * Default {@link QueryDefinitionProps.maxVisiblePills} when the prop is omitted.
 *
 * @internal
 */
export const DEFAULT_MAX_VISIBLE_PILLS = 4;

type CollapseAcc = {
  readonly visible: QueryDefinitionViewModel;
  readonly pendingConnector: ConnectorItem | undefined;
};

/**
 * Picks pill indexes that stay visible when the definition is collapsed.
 * Pinned pills fill the budget first (in display order); remaining slots go to unpinned pills.
 * When pinned count exceeds `maxVisible`, only the first `maxVisible` pinned pills are kept.
 *
 * @param viewModel - Ordered pills and connectors
 * @param maxVisible - Maximum number of pills to keep
 * @returns Indexes of pills that remain visible
 * @internal
 */
export function selectVisiblePillIndexes(
  viewModel: QueryDefinitionViewModel,
  maxVisible: number,
): ReadonlySet<number> {
  const pillIndexes = viewModel.flatMap((item, index) => (isPillItem(item) ? [index] : []));
  const pinned = pillIndexes.filter((index) => {
    const item = viewModel[index];
    return isPillItem(item) && item.pin;
  });
  const unpinned = pillIndexes.filter((index) => {
    const item = viewModel[index];
    return isPillItem(item) && !item.pin;
  });

  if (pinned.length >= maxVisible) {
    return new Set(pinned.slice(0, maxVisible));
  }
  return new Set([...pinned, ...unpinned.slice(0, maxVisible - pinned.length)]);
}

function nextCollapseAcc(
  acc: CollapseAcc,
  item: QueryDefinitionViewModel[number],
  index: number,
  selected: ReadonlySet<number>,
): CollapseAcc {
  if (!isPillItem(item)) {
    return { ...acc, pendingConnector: item };
  }
  if (!selected.has(index)) {
    return acc;
  }
  const visible =
    acc.pendingConnector && acc.visible.length > 0
      ? [...acc.visible, acc.pendingConnector, item]
      : [...acc.visible, item];
  return { visible, pendingConnector: undefined };
}

/**
 * Splits the view model into the collapsed visible slice and the count of hidden pills.
 * Connectors are kept only between two consecutive visible pills (the last connector that
 * appeared between them), so hiding a middle pill cannot leave a duplicate “by”.
 *
 * @param viewModel - Ordered pills and connectors
 * @param maxVisible - Maximum number of pills to keep; defaults to {@link DEFAULT_MAX_VISIBLE_PILLS}
 * @returns Visible items for the collapsed row, and how many pills are hidden
 * @internal
 */
export function splitCollapsedView(
  viewModel: QueryDefinitionViewModel,
  maxVisible: number = DEFAULT_MAX_VISIBLE_PILLS,
): {
  visible: QueryDefinitionViewModel;
  moreCount: number;
} {
  const pillIndexes = viewModel.flatMap((item, index) => (isPillItem(item) ? [index] : []));

  if (pillIndexes.length <= maxVisible) {
    return { visible: viewModel, moreCount: 0 };
  }

  const selected = selectVisiblePillIndexes(viewModel, maxVisible);
  const moreCount = pillIndexes.length - selected.size;
  const { visible } = viewModel.reduce<CollapseAcc>(
    (acc, item, index) => nextCollapseAcc(acc, item, index, selected),
    { visible: [], pendingConnector: undefined },
  );

  return { visible, moreCount };
}

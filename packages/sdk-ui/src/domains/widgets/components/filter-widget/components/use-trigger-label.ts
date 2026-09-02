import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { SelectedMember } from '@/domains/filters/components/member-filter-tile/members-reducer';

import { getMembersFilterSelectTriggerLabel } from './trigger-label';

/** @internal */
export type TriggerLabel = {
  /** What the closed box reads when it is not naming a list — a placeholder, a count, `Include all`. */
  label: string;
  /**
   * The chosen values, when the box *is* naming a list.
   *
   * Handed over unfitted: how many of them a trigger can show is a question about the width of a
   * particular box, so `Selector` answers it and adds the `+N` itself.
   */
  names?: string[];
  /** Nothing is selected in include mode, so the box is showing its placeholder. */
  isPlaceholderShown: boolean;
};

/**
 * Works out what a members trigger reads back, for both the flat control and the date panel.
 *
 * One hook so the two cannot word the same selection differently — the drift that splitting the
 * decision tree from its presentation is there to prevent.
 * @param selectedMembers - The current inclusions or exclusions
 * @param excludeMembers - Whether the list is in exclude mode
 * @param totalMembersCount - Members-query total, or undefined while searching
 * @param placeholder - Overrides the default `Set filter` placeholder
 * @returns The label, the values to name when there are any, and whether the placeholder shows
 * @internal
 */
export function useTriggerLabel(
  selectedMembers: readonly SelectedMember[],
  excludeMembers: boolean,
  totalMembersCount?: number,
  placeholder?: string,
): TriggerLabel {
  const { t } = useTranslation();

  return useMemo(() => {
    const isPlaceholderShown = !excludeMembers && selectedMembers.length === 0;
    const titles = selectedMembers.map((member) => member.title);

    /* A filter on every value says so. Without this a complete selection reads `Q1, Q2 +7`,
       which is the same sentence as two of nine and means something quite different.
       Counted over the members that actually filter: a deactivated member sits in the selection
       without narrowing anything, so counting it read `Include all` for a filter that let only
       some values through. Every title is still named — a deactivated member is part of the
       selection the reader sees. */
    const activeCount = selectedMembers.filter((member) => !member.inactive).length;
    const isComplete =
      !excludeMembers &&
      typeof totalMembersCount === 'number' &&
      totalMembersCount > 0 &&
      activeCount >= totalMembersCount;

    const label = getMembersFilterSelectTriggerLabel({
      selectedMembers,
      excludeMembers,
      placeholder: placeholder ?? t('filterWidget.placeholders.setFilter'),
      includeAllLabel: t('includeAll'),
      formatSelectedCount: (count) => t('filterWidget.selectedCount', { count }),
      formatAllExceptCount: (count) => t('filterWidget.allExceptCount', { count }),
      totalMembersCount,
      /* Named in full. The trigger fits them to its own width, and the hover wants every one. */
      formatIncludedTitles: (included) => included.join(', '),
    });

    if (isComplete) {
      return { label: t('includeAll'), isPlaceholderShown };
    }
    // Only include mode names its values: exclude mode has no names to give, and reporting
    // exclusions as selections is the bug the decision tree guards against.
    const names = !excludeMembers && titles.length > 0 ? titles : undefined;

    return { label, names, isPlaceholderShown };
  }, [selectedMembers, excludeMembers, totalMembersCount, placeholder, t]);
}

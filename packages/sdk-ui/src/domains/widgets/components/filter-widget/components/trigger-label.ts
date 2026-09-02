import type { SelectedMember } from '@/domains/filters/components/member-filter-tile/members-reducer';

/** Same cap as filter-editor `getSelectedItemsDisplayValue`. */
const MAX_DISPLAY_ITEMS = 3;

/**
 * Carries what a closed trigger needs in order to decide what it says.
 *
 * An object rather than a parameter list: there are eight of them, four are strings or
 * string-returning functions, and at a call site positional order would be guesswork.
 * @internal
 */
export type MembersTriggerLabelInput = {
  /** Holds the currently selected or excluded members. */
  selectedMembers: readonly SelectedMember[];
  /** Marks the list as being in exclude mode. */
  excludeMembers: boolean;
  /** Reads out when nothing is selected in include mode. */
  placeholder: string;
  /** Reads out for the select-all state. */
  includeAllLabel: string;
  /** Formats a localized `"N selected"`. */
  formatSelectedCount: (count: number) => string;
  /** Formats a localized `"All except N"`, for exclude mode with no known total. */
  formatAllExceptCount: (count: number) => string;
  /** Counts what the members query offers, pre-pagination; may reflect a search. */
  totalMembersCount?: number;
  /**
   * Renders the include-mode titles, replacing the count and the three-title join.
   *
   * The control set passes a full join here and lets the trigger fit the names to its own
   * width; omitted, the original wording stands.
   */
  formatIncludedTitles?: (titles: string[]) => string;
};

/**
 * Builds the closed-trigger label for a unified members selection.
 *
 * - Select-all (`excludeMembers` + empty list) → include-all, whatever the total says
 * - Exclude mode with exclusions → remaining count (`total - exclusions`) when total
 * is known; otherwise `"All except N"` (never `"N selected"` — that would mislabel
 * exclusions as selected)
 * - Empty include → placeholder
 * - Include mode → up to three titles, else `"N selected"`, unless the caller supplies
 * its own presentation through `formatIncludedTitles`
 *
 * This is the single source of truth for *which* label a trigger shows. Only the
 * include-mode presentation is delegated, and only when asked: exclude mode has no
 * names to give, so a caller cannot reword it into something that reports exclusions
 * as selections.
 * @param input - The selection, the localized strings, and the optional include-mode renderer
 * @returns Trigger display string
 * @internal
 */
export function getMembersFilterSelectTriggerLabel({
  selectedMembers,
  excludeMembers,
  placeholder,
  includeAllLabel,
  formatSelectedCount,
  formatAllExceptCount,
  totalMembersCount,
  formatIncludedTitles,
}: MembersTriggerLabelInput): string {
  if (excludeMembers) {
    /* Excluding nothing is a filter on everything, and it says so — before the total is
       consulted. Reporting the total as a count instead ("5 selected") made the widget
       disagree with its own linked panel tile, which reads "Include all" for exactly this
       state, and read as a narrowing filter where nothing is filtered at all. It was worst
       where the level offers a single value: "1 selected" for a filter that excludes nothing. */
    if (selectedMembers.length === 0) {
      return includeAllLabel;
    }
    // Exclusions are the blacklist — never surface their titles as the selection.
    if (typeof totalMembersCount === 'number') {
      return formatSelectedCount(Math.max(0, totalMembersCount - selectedMembers.length));
    }
    return formatAllExceptCount(selectedMembers.length);
  }

  if (selectedMembers.length === 0) {
    return placeholder;
  }

  const titles = selectedMembers.map((member) => member.title);

  if (formatIncludedTitles) {
    return formatIncludedTitles(titles);
  }
  if (selectedMembers.length > MAX_DISPLAY_ITEMS) {
    return formatSelectedCount(selectedMembers.length);
  }
  return titles.join(', ');
}

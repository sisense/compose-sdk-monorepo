export type FilterEditorConfig = {
  multiSelect?: {
    visible?: boolean;
  };
  /**
   * Controls whether the ranking conditions — "Top" and "Bottom" — are offered.
   *
   * Hiding them still keeps a ranking condition that the edited filter already uses, so an existing
   * ranking filter stays editable rather than opening onto a condition that is missing from the list.
   *
   * @internal
   */
  ranking?: {
    visible?: boolean;
  };
  /**
   * Restricts the editor to selecting members.
   *
   * Describes the filter, not the user: it is set when a filter structurally supports nothing but
   * member selection, such as a cascading filter level. Not a permission flag — to restrict the
   * conditions a user may choose, narrow the individual capabilities instead.
   *
   * @internal
   **/
  membersOnlyMode?: boolean;
};

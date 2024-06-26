/** @internal */
export enum CommonFiltersApplyMode {
  HIGHLIGHT = 'highlight',
  FILTER = 'filter',
}

/** @internal */
export type CommonFiltersOptions = {
  applyMode?: `${CommonFiltersApplyMode}`;
  shouldAffectFilters?: boolean;
  ignoreFilters?: {
    all?: boolean;
    ids?: string[];
  };
};

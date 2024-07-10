import { DeepRequired } from 'ts-essentials';

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
  forceApplyBackgroundFilters?: boolean;
};

/** @internal */
export type CompleteCommonFiltersOptions = DeepRequired<CommonFiltersOptions>;

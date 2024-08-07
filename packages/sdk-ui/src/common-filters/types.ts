import { CascadingFilter, Filter } from '@sisense/sdk-data';
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
  ignoreFilters?: FiltersIgnoringRules;
  forceApplyBackgroundFilters?: boolean;
};

/** @internal */
export type FiltersIgnoringRules = {
  all?: boolean;
  ids?: string[];
};

/** @internal */
export type CompleteCommonFiltersOptions = DeepRequired<CommonFiltersOptions>;

/** Filters that are real pure simple filters (non-cascading filters) */
export type PureFilter<F extends Filter = Filter> = F extends CascadingFilter ? never : F;

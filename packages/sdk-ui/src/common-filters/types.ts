import { CascadingFilter, Filter } from '@sisense/sdk-data';
import { DeepRequired } from 'ts-essentials';

/**
 * Common filters apply mode.
 */
export enum CommonFiltersApplyMode {
  HIGHLIGHT = 'highlight',
  FILTER = 'filter',
}

/**
 * Options for common filters defined at the dashboard level to be applied to certain widgets.
 */
export type CommonFiltersOptions = {
  applyMode?: `${CommonFiltersApplyMode}`;
  shouldAffectFilters?: boolean;
  ignoreFilters?: FiltersIgnoringRules;
  forceApplyBackgroundFilters?: boolean;
};

/**
 * Filters ignoring rules.
 */
export type FiltersIgnoringRules = {
  all?: boolean;
  ids?: string[];
};

/** @internal */
export type CompleteCommonFiltersOptions = DeepRequired<CommonFiltersOptions>;

/** Filters that are real pure simple filters (non-cascading filters) */
export type PureFilter<F extends Filter = Filter> = F extends CascadingFilter ? never : F;

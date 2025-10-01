import { CascadingFilter, Filter } from '@ethings-os/sdk-data';
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
  /**
   * Apply mode for common filters: 'highlight' or 'filter'.
   */
  applyMode?: `${CommonFiltersApplyMode}`;
  /**
   * Boolean flag whether widget interactions – for example, selection of bars on a bar chart –
   * should affect common filters.
   *
   * If not specified, the default value is `true`.
   */
  shouldAffectFilters?: boolean;
  /**
   * Filters to ignore when applying common filters.
   */
  ignoreFilters?: FiltersIgnoringRules;
  /**
   * Boolean flag whether to apply all background filters as slice filters ignoring "disabled" state and "ignoreFilters" rules
   *
   * If not specified, the default value is `true`.
   */
  forceApplyBackgroundFilters?: boolean;
};

/**
 * Filters ignoring rules.
 */
export type FiltersIgnoringRules = {
  /**
   * Boolean flag whether to ignore all filters.
   *
   * If not specified, the default value is `false`.
   */
  all?: boolean;
  /**
   * Filter GUIDs to ignore.
   */
  ids?: string[];
};

/** @internal */
export type CompleteCommonFiltersOptions = DeepRequired<CommonFiltersOptions>;

/** Filters that are real pure simple filters (non-cascading filters) */
export type PureFilter<F extends Filter = Filter> = F extends CascadingFilter ? never : F;

import { NumericFilter, TextFilter, RankingFilter, ExcludeFilter } from '@sisense/sdk-data';

/**
 * Deprecated type for `filter` property of {@link CriteriaFilterTileProps}.
 * Use regular {@link @sisense/sdk-data!Filter | Filter} instead.
 * @deprecated
 */
export type CriteriaFilterType = NumericFilter | TextFilter | RankingFilter | ExcludeFilter;

import { Filter, FilterRelations } from '@ethings-os/sdk-data';

export type FilterChangeEvent = {
  /** Filter that was changed */
  filter: Filter | null;
};

export type FilterEditEvent = {
  /** Index of the filter level that triggers the edit event (in the case of a cascading filter) */
  levelIndex?: number;
};

export type FiltersPanelChangeEvent = {
  /** The updated filters */
  filters: Filter[] | FilterRelations;
};

/**
 * Filter change event handler.
 */
export type FilterChangeEventHandler = (event: FilterChangeEvent) => void;

/**
 * Filter edit event handler.
 */
export type FilterEditEventHandler = (event: FilterEditEvent) => void;

/**
 * Filter delete event handler.
 */
export type FilterDeleteEventHandler = () => void;

/**
 * Filters panel change event handler.
 */
export type FiltersPanelChangeEventHandler = (event: FiltersPanelChangeEvent) => void;

export interface BaseFilterTileEventProps {
  /**
   * {@inheritDoc FilterChangeEventHandler}
   */
  filterChange?: FilterChangeEventHandler;
  /**
   * {@inheritDoc FilterEditEventHandler}
   */
  filterEdit?: FilterEditEventHandler;
  /**
   * {@inheritDoc FilterDeleteEventHandler}
   */
  filterDelete?: FilterDeleteEventHandler;
}

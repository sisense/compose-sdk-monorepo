// JTD (Jump to Dashboard) Feature Module
// Re-exports for easier importing and better organization

// Filter utilities
export {
  getFiltersFromDataPoint,
  getFormulaContextFilters,
  filterByAllowedDimensions,
  handleFormulaDuplicateFilters,
  mergeJtdFilters,
} from './jtd-filters';

// Handler utilities
export {
  getJtdClickHandler,
  getJtdClickHandlerForMultiplePoints,
  handleDataPointClick,
  handleTextWidgetClick,
} from './jtd-handlers';

// Menu utilities
export {
  getJumpToDashboardMenuItem,
  getJumpToDashboardMenuItemForMultiplePoints,
} from './jtd-menu';

// Widget transform utilities
export {
  addPointerCursorToChart,
  applyClickNavigationForChart,
  applyClickNavigationForText,
  applyRightClickNavigation,
  addJtdIconToHeader,
} from './jtd-widget-transforms';

// Unified types
export {
  type JtdCoreData,
  type JtdContext,
  type JtdActions,
  type JtdClickHandlerData,
  type JtdWidgetTransformConfig,
  type JtdDataPointClickEvent,
  type JtdMenuItem,
} from './jtd-types';

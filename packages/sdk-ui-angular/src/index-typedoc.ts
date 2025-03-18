// Main entry point for typedoc documentation generation
// Combine both the main and submodule paths, for example, ai
// Array of entry points are NOT used as they alter the module structure in the generated documentation

/**
 * @packageDocumentation
 * @groupDescription Charts
 * Angular components and utilities for working with charts
 * @groupDescription Data Grids
 * Angular components for data grids
 * @groupDescription Drilldown
 * Angular components for creating drilldown experiences
 * @groupDescription Filter Tiles
 * Angular filter tile components
 * @groupDescription Contexts
 * Angular context modules, services, and variables
 * @groupDescription Queries
 * Angular query service
 * @groupDescription Dashboards
 * Angular components and utilities for working with dashboards
 * @groupDescription Fusion Assets
 * Angular modules, services, and components for working with Fusion dashboards, widgets, queries, and formulas
 * @groupDescription Interfaces
 * TypeScript interfaces for components and services listed above
 * @groupDescription Type Aliases
 * TypeScript type aliases for components and services listed above
 */
export * from './public-api';
export * from './ai/public-api';

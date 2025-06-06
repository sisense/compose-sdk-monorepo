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
 * Angular components, services, and utilities for working with Fusion dashboards, widgets, queries, and formulas
 * @groupDescription Generative AI
 * Angular modules, components, and services for working with Generative AI features provided by Sisense Fusion
 * ::: tip Note
 * For more information on requirements for enabling Generative AI features, please refer to the [Generative AI documentation](https://docs.sisense.com/main/SisenseLinux/genai.htm)
 * :::
 * @groupDescription Interfaces
 * TypeScript interfaces for components and services listed above
 * @groupDescription Type Aliases
 * TypeScript type aliases for components and services listed above
 */
export * from './ai/public-api';
export * from './public-api';

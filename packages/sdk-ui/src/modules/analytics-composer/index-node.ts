/**
 * Node.js compatible exports for analytics-composer
 *
 * This module exports only the functions that work in Node.js environment
 * without any browser dependencies like DOM, React components, or chart libraries.
 */

// Types - always safe
export * from './types';

// Serialization utilities
export * from './common/custom-superjson';

// NLQ v3 translation functionality
export * from './nlq-v3-translator';

// Note: Widget, dashboard, and chart-related functionality is excluded
// as it depends on browser-specific APIs and React components

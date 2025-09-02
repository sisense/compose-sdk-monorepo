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

// New NLQ translation functionality
export * from './new-nlq-translator/';

// Note: Widget, dashboard, and chart-related functionality is excluded
// as it depends on browser-specific APIs and React components

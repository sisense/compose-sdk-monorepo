// Transition: the adapter layer stays reachable from the package root until the framework
// wrappers import it from `@sisense/sdk-ui-preact/internal`; these two re-exports are then removed.
export * from './component-adapter';
export * from './render';
export * from '@sisense/sdk-ui';

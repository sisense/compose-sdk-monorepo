export * from './modules/ai';
export * from './modules/analytics-composer';
export * from './index';

// TEMPORARY WORKAROUND: re-export selected sdk-data features so Fusion can build
// CSDK filters and Attribute instances from the sdk-ui UMD bundle without a separate
// sdk-data UMD bundle. This blurs the data-layer boundary (consumers should import
// these from '@sisense/sdk-data') and must be removed once sdk-data ships its own
// UMD module. Tracked as a separate activity: "make @sisense/sdk-data available in
// Fusion as a UMD module".
export { filterFactory, createAttribute } from '@sisense/sdk-data';

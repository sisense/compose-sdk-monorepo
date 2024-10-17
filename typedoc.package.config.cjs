// TypeDoc base config for each package to extend from.
const baseConfig = {
  includeVersion: true,
  entryPoints: ['src/index.ts'],
  // sort the code items by alphabetical order
  sort: ['alphabetical'],
  categorizeByGroup: true,
  categoryOrder: ['Data', 'Chart', 'Widget', 'Callbacks', '*'],
  groupOrder: [
    /* sdk-ui* */
    'Charts',
    'Data Grids',
    'Drilldown',
    'Filter Tiles',
    'Contexts',
    'Queries',
    'Dashboards',
    'Fusion Embed',
    'Generative AI',
    /* sdk-data */
    'Factories',
    'Data Model Utilities',
    /* measureFactory */
    'Aggregation',
    'Arithmetic',
    'Time-based',
    'Statistics',
    'Advanced Analytics',
    '*',
  ],
  // set to empty so @alpha and @beta tags are not passed down to the children
  cascadedModifierTags: [],
};

if (process.env.TYPEDOC_MODE === 'PUBLIC') {
  /** @type {import("typedoc").TypeDocOptionValues} */
  module.exports = {
    ...baseConfig,
    excludePrivate: true,
    excludeInternal: true,
    excludeExternals: true,
    excludeProtected: true,
    // hide text describing where a code item is located in the source
    disableSources: true,
    hideGenerator: true,
  };
} else {
  /** @type {import("typedoc").TypeDocOptionValues} */
  module.exports = {
    ...baseConfig,
    excludePrivate: false,
    excludeInternal: false,
    // set excludeTags to an empty array to show @privateRemarks in the docs
    excludeTags: [],
    // show text describing where a code item is located in the source
    disableSources: false,
    hideGenerator: false,
  };
}

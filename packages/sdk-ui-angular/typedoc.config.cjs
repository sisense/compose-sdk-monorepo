// TypeDoc config for the package
const baseConfig = require('../../typedoc.package.config.cjs');
/** @type {import('typedoc').TypeDocOptionValues} */
module.exports = {
  ...baseConfig,
  entryPoints: ['src/index-typedoc.ts'],
  intentionallyNotExported: ['ArgumentsAsObject'],
  excludeCategories: ['Sisense App Error Handling'], // feature not supported yet in Angular
};

// TypeDoc config for the package
const baseConfig = require('../../typedoc.package.config.cjs');
/** @type {import('typedoc').TypeDocOptionValues} */
module.exports = {
  ...baseConfig,
  entryPoints: ['src/public-api.ts'],
  intentionallyNotExported: ['ArgumentsAsObject'],
};

// TypeDoc config for the package
const baseConfig = require('../../typedoc.package.config.cjs');
/** @type {import('typedoc').TypeDocOptionValues} */
module.exports = {
  ...baseConfig,
  // HighchartsOptions is not exported. Instead, we refer the users to the Highcharts documentation.
  intentionallyNotExported: ['HighchartsOptions'],
};

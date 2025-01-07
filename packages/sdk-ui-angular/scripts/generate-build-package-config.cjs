const fs = require('fs');
const rootPackageConfig = require('../package.json');

/**
 * Angular libraries follow a specific build flow where a nested `package.json` is generated inside the `dist` folder.
 * It is assumed that only the content of the `dist` folder, along with the newly generated `package.json`, will be published.
 * Unfortunately, this behavior differs from our current build ang publish flow and conflicts with our monorepo configuration.
 *
 * As a result, a workaround was implemented to generate a temporary `src/package.json` solely for the build process.
 * This temporary file should not contain any `exports` configuration, as it causes the `ng-packagr` builder to fail.
 *
 * Note: This issue was fixed in `ng-packagr` v16, but upgrading to that version would introduce breaking changes in generated dist structure.
 */
const angularBuildPackageConfig = {
  ...rootPackageConfig,
  exports: {},
};

fs.writeFileSync('./src/package.json', JSON.stringify(angularBuildPackageConfig));

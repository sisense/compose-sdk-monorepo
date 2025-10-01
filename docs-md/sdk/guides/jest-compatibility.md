---
title: Setting Up Jest for Compatibility with Compose SDK
---

# Setting Up Jest for Compatibility with Compose SDK

## Overview

The Compose SDK packages are built with ECMAScript Modules (ESM), while Jest, by default, expects CommonJS (CJS) modules. This difference creates compatibility challenges when using Jest for testing with Compose SDK. You can learn more about the differences between ESM and CJS in the [Node.js official documentation](https://nodejs.org/api/esm.html#esm_differences_between_es_modules_and_commonjs). While Jest does provide [experimental ESM support](https://jestjs.io/docs/ecmascript-modules), it remains unstable and not recommended for production use.

## Including CommonJS packages

Starting with version 1.22.0, Compose SDK packages include a CommonJS build alongside the ESM build. This allows you to configure Jest to use the CJS version of Compose SDK in tests, while the main application can continue using the ESM version.

### File Structure for CJS in Compose SDK

-   *Primary Package* (`sdk-ui`): Includes `.cjs` files alongside `.js` files within the `dist` folder.
-   *Other Packages* (`sdk-common`, `sdk-data`, `sdk-modeling`, `sdk-query-client`, `sdk-rest-client`, `sdk-tracking`): Contain a `cjs` folder within the `dist` directory, which houses the CJS build files.

## Configuring Jest to Use CJS Packages
To direct Jest to the appropriate CJS files, you’ll use the [`moduleNameMapper`](https://jestjs.io/docs/tutorial-react-native#modulenamemapper) configuration in your Jest config. This maps the ESM package paths to the CJS equivalents.

**Note**: Compose SDK uses the ESM version of [lodash](https://lodash.com/), so it’s also necessary to map lodash explicitly to its CJS version.

Here are suggested configurations for common frameworks:

### Jest `moduleNameMapper` Configuration

**React**
```
"moduleNameMapper": {
  "^@ethings-os/sdk-(common|data|modeling|query-client|rest-client|tracking)(.*)$": "<rootDir>/node_modules/@ethings-os/sdk-$1/dist/cjs$2",
  "^@ethings-os/sdk-ui(.*)$": "<rootDir>/node_modules/@ethings-os/sdk-ui/dist$1",
  "^lodash-es(.*)$": "<rootDir>/node_modules/lodash$1"
}
```
**Angular**
```
"moduleNameMapper": {
  "^@ethings-os/sdk-(common|data|modeling|query-client|rest-client|tracking)(.*)$": "<rootDir>/node_modules/@ethings-os/sdk-$1/dist/cjs$2",
  "^@ethings-os/sdk-ui-angular(.*)$": "<rootDir>/node_modules/@ethings-os/sdk-ui-angular/dist/fesm2020/sisense-sdk-ui-angular.mjs",
  "^lodash-es(.*)$": "<rootDir>/node_modules/lodash$1"
}
```
**Vue**:
```
"moduleNameMapper": {
  "^@ethings-os/sdk-(common|data|modeling|query-client|rest-client|tracking)(.*)$": "<rootDir>/node_modules/@ethings-os/sdk-$1/dist/cjs$2",
  "^@ethings-os/sdk-ui-vue(.*)$": "<rootDir>/node_modules/@ethings-os/sdk-ui-vue/dist$1",
  "^lodash-es(.*)$": "<rootDir>/node_modules/lodash$1"
}
```
## Conclusion

By mapping the necessary Compose SDK packages to their CJS builds, Jest can effectively work with Compose SDK. This setup ensures that testing compatibility is maintained without impacting the main application’s use of ESM.

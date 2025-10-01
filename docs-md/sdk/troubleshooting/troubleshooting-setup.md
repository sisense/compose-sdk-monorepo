# Setup and Infrastructure Troubleshooting

This troubleshooting guide provides possible answers to common issues that may arise when trying to install Compose SDK using `yarn` or `npm`.

## Error Messages

| **Action**             | **Error Message/Behavior**                                                                                           | **Solution/Workaround**                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
|------------------------|----------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `yarn install`         | RequestError: unable to get local issuer certificate                                                                 | Check your Internet security firewalls or VPNs to see if external access is blocked.                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `yarn install`         | Invalid authentication (as an anonymous user)                                                                        | Configure your personal access token for the GitHub Packages Registry (GPR). <br /> Try deleting `yarn.lock` and running `yarn cache clean --all` before running `yarn install` again. <br /><br /> Note that since version `0.11.3`, the SDK packages are hosted on public NPM registry. Consider upgrading SDK to the latest version and removing the configuration for GPR.                                                                                                                        |
| `yarn install`         | No `@ethings-os/sdk\*` modules installed in `node\_modules` causing the CLI command to fail to generate the data model  | Check if `Yarn Plug'n'Play` is enabled by checking to see if `pnp.cjs` is in the root folder after running `yarn install`. To fix, add `nodeLinker: node-modules` to your `.yarnrc.yml` file located in the root folder and run `yarn install` again.                                                                                                                                                                                                                                                 |
| CLI command with `npx` | No output in the console and the data model file is not generated                                                    | Check if `Yarn Plug'n'Play` is enabled by checking to see if `pnp.cjs` is in the root folder after running `yarn install`. <br /><br />This feature is available in **Yarn 4.x**, which is not a stable version. To fix, switch to Yarn version 3.x (stable) by running the command `yarn set version stable`. Run `yarn -v` to see your current version, and verify that version 3.x is used. <br /><br />Run `yarn install` to install the packages again. <br /><br />Run the `npx` command again. |

## Authentication

**Issue:**

I can't access my Sisense instance.

**Solution:**

First check that you can access your Sisense instance directly. If this works, then check your authentication methods to see if they are configured correctly. You can use the following authentication methods:

* [SSO](../getting-started/authentication-security.md#single-sign-on)
* [Web access tokens](../getting-started/authentication-security.md#web-access-token)
* [Sisense API token](../getting-started/authentication-security.md#api-token)

## Browser Security

**Issue:**

There is a warning saying that my app website is not secure.

**Solution:**
1. This warning is displayed on any page served over an insecure protocol such as HTTP. Contact your administrator to resolve it by enabling the HTTPS protocol.
2. This may be an issue with SSL certificate. Contact your administrator to correct the certificate or to make a new one available for you to use.
3. This may be a conflict with your anti-virus software and your corporate network. Contact your administrator for more assistance.

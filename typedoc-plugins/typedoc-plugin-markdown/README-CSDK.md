# @sisense/typedoc-plugin-markdown

This plugin was forked from `tgreyuk/typedoc-plugin-markdown` version `4.0.0-next.20`.

It contains customizations for Compose SDK and is no longer compatible with the latest version of `tgreyuk/typedoc-plugin-markdown`.

## Build

The plugin is set up as a private Yarn workspace. It means that running `yarn build` or `yarn build:prod`
at the root of the repository will build the plugin along with other packages.

To build only the plugin, run:

```
# From the root directory
yarn workspace @sisense/typedoc-plugin-markdown run build
```

or

```
# From directory typedoc-plugins/typedoc-plugin-markdown
yarn build
```

## Publish

Currently, this plugin is NOT published to npm.
It is used as a local package in the Compose SDK repository. Its version is fixed at `0.0.0`.

## Development

There are two approaches to updating the plugin:

(1) Make changes in the `src` directory and run `yarn docs:gen:md` from the root directory of the repo to (re)build the plugin and
see how the changes affect the generated markdown files. A downside of this approach is that running `yarn docs:gen:md` is slow as
it regenerates the entire Compose SDK documentation. Still, this approach is a sure way to see how the changes affect the generated markdown files.

(2) Make changes in the `src` directory and run `yarn build && yarn docs:md-csdk` from the `typedoc-plugins/typedoc-plugin-markdown` directory.
This approach is much faster as it only rebuilds the plugin and regenerates the markdown files for _mock_ compose sdk sources files defined in `typedoc-plugins/typedoc-plugin-markdown/__mocks__/csdk-minirepo`.

Both approaches support debugging in IDEs.

## Testing

There are tests from the original `tgreyuk/typedoc-plugin-markdown` that are not moved to this forked plugin yet.
https://github.com/tgreyuk/typedoc-plugin-markdown/tree/changeset-release/next/packages/typedoc-plugin-markdown/test

Manual testing should be used during development to ensure that the plugin works as expected.

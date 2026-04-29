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

### Update the plugin code

There are two approaches to updating the plugin:

(1) Make changes in the `src` directory and run `yarn docs:gen:md` from the root directory of the repo to (re)build the plugin and
see how the changes affect the generated markdown files. A downside of this approach is that running `yarn docs:gen:md` is slow as
it regenerates the entire Compose SDK documentation. Still, this approach is a sure way to see how the changes affect the generated markdown files.

(2) Make changes in the `src` directory and run `yarn build && yarn docs:md-csdk` from the `typedoc-plugins/typedoc-plugin-markdown` directory.
This approach is much faster as it only rebuilds the plugin and regenerates the markdown files for _mock_ compose sdk sources files defined in `typedoc-plugins/typedoc-plugin-markdown/__mocks__/csdk-minirepo`.

Both approaches support debugging in IDEs.

### Add config options

1. Add new options to `typedoc-plugins/typedoc-plugin-markdown/src/plugin/options/config.ts` – see `hiddenFunctionParameters` as an example
2. Run `ts-node scripts/code/options` from `typedoc-plugins/typedoc-plugin-markdown/`

Other examples of config options that were added for docusaurus compatibility, enabled by default only for `TYPEDOC_FORMAT === 'MDX'` output via `/typedoc.config.cjs`

#### **`useHTMLEncodedBrackets`**
When `true`, angle brackets in generated markdown (outside of TSDoc Comments) are output as HTML entities (`&lt;`, `&gt;`) so that MDX processors do not interpret them as JSX.

#### **`convertHtmlToJsxInComments`**
When `true`, allowed tags (e.g. `<iframe ...>` or `<img ..>`) in TSDoc comments are converted to valid JSX (e.g. `style='border:none;'` becomes `style={{ border: 'none' }}`).
Also, guide links in comments are rewritten so Docusaurus routes work: `/guides/sdk/` becomes `/docs/compose-sdk/` in the `docs-mdx` output.

#### **`escapeHtmlInComments`**
When `true`, all angle brackets like `<` and `>` in TSDoc comments are encoded as HTML entities so tags appear as literal text in MDX.

The monorepo uses two scripts:
- `yarn docs:gen:md` for VuePress (output in `docs-md/`, raw HTML in comments)
- `yarn docs:gen:mdx` for Docusaurus (output in `docs-mdx/`, comments converted to JSX).

## Testing

There are tests from the original `tgreyuk/typedoc-plugin-markdown` that are not moved to this forked plugin yet.
https://github.com/tgreyuk/typedoc-plugin-markdown/tree/changeset-release/next/packages/typedoc-plugin-markdown/test

Manual testing should be used during development to ensure that the plugin works as expected.

## What is this directory, `docs-md`, for?
This directory contains the source files for the Compose SDK documentation on `sisense.dev`.

This includes the Quickstart guide (`docs-md/sdk/quickstart.md`) and the generated API reference (`docs-md/sdk/modules`).

All changes to the Compose SDK documentation should be made here and then moved to the repo
for the `sisense.dev` site.

## How to update the Quickstart guide?
Open `docs-md/sdk/quickstart.md` and make your changes as usual.

## How to generate the API reference?
From the root directory of this monorepo, run

```sh
yarn docs:gen:md
```

The generated files will be placed in `docs-md/sdk/modules`.

DO NOT MANUALLY EDIT FILES IN THIS DIRECTORY.

## How to move the changes to the repo for `sisense.dev`?
From the root directory of this monorepo, run
`rm -Rf <path to sisense.dev repo>/docs/guides/sdk/ && cp -Rf docs-md/sdk <path to sisense.dev repo>/docs/guides/`.

For example, if the `sisense.dev` repo is cloned to `~/dev/dev-docs`,
run

```sh
rm -Rf ~/dev/dev-docs/docs/guides/sdk/ && cp -Rf docs-md/sdk ~/dev/dev-docs/docs/guides/
```

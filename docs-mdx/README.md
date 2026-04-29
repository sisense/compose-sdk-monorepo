# NOT CURRENTLY USED IN PRODUCTION
# PLEASE IGNORE AND CONTINUE USING `docs-md` FOLDER

## What is this directory, `docs-mdx`, for?
This directory is a **fork of docs-md** for Docusaurus. Static content (guides, quickstarts, index-modules.md, etc.) is maintained here.

It contains the source files for the Compose SDK documentation on `developer.sisense.com`, including the CHANGELOG (`docs-mdx/compose-sdk/CHANGELOG.md`), Quickstart guides, other guides, tutorials, and the generated API reference (`docs-mdx/compose-sdk/modules`).

All changes to the Compose SDK documentation should be made here and then moved to the repo
for the `developer.sisense.com` site.

## How to update the guides and tutorials?
To update the quickstart guides, open `docs-mdx/compose-sdk/quickstart.md`, `docs-mdx/compose-sdk/quickstart-angular.md`, or (`docs-mdx/compose-sdk/quickstart-vue.md`)
and make your changes as usual.

Other guides and tutorials can be updated in the same way.

## How to generate the API reference?
From the root directory of this monorepo, run

```sh
yarn docs:gen:mdx
```
The generated files will be placed in **`docs-mdx/compose-sdk/modules`** (and CHANGELOG/img under `docs-mdx/compose-sdk/`).

DO NOT MANUALLY EDIT FILES IN `docs-mdx/compose-sdk/modules`.

## How to update the CHANGELOG?
DO NOT MANUALLY EDIT CHANGELOG.MD IN `docs-mdx/compose-sdk`.

Instead, make changes in `CHANGELOG.md` in the root directory of this monorepo and then re-run

```sh
yarn docs:gen:mdx
```

The process will copy `./CHANGELOG.md` to `docs-mdx/compose-sdk/CHANGELOG.md`.

## How to move the changes to the repo for `developer.sisense.com`?
DO NOT DO THIS! WORK STILL IN PROGRESS!

~~From the root directory of this monorepo, run~~
~~`rm -Rf <path to developer.sisense.com repo>/docs/compose-sdk/ && cp -Rf docs-mdx/compose-sdk <path to developer.sisense.com repo>/docs/`.~~

~~For example, if the `developer.sisense.com` repo is cloned to `~/repos/dev-docusaurus`,~~
~~run~~

```sh
~~rm -Rf ~/repos/dev-docusaurus/docs/compose-sdk/ && cp -Rf docs-mdx/compose-sdk ~~/repos/dev-docusaurus/docs/
```

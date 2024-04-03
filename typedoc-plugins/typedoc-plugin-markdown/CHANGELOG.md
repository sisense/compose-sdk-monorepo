# Changelog

## 4.0.0-next.26

- Group reflections to directories by `@group`
- Support `@groupDescription`
- Hide member inheritance and type hierarchy in member reflection

## 4.0.0-next.20

### Patch Changes

- UI improvements
- Enable anchor to items inside table

## 4.0.0-next.19 (2023-08-27)

### Patch Changes

- TypeDoc 0.25.0 compatibility fixes

## 4.0.0-next.18 (2023-08-10)

### Patch Changes

- Split out comment summary and tags for signatures
- Added `titleTemplate` option to replace hideKindPrefix option
- Fixed incorrect heading title for monorepo packages
- Disable in-built Prettier formatting

## 4.0.0-next.17 (2023-07-07)

### Patch Changes

- Prettier 3.0 support

## 4.0.0-next.16 (2023-06-13)

### Patch Changes

- Omit number prefixes from index files

## 4.0.0-next.15 (2023-06-13)

### Patch Changes

- Remove namespace from module filenames

## 4.0.0-next.14 (2023-06-12)

### Patch Changes

- Export plugin options

## 4.0.0-next.13 (2023-05-26)

### Patch Changes

- Added ability to easily override templates for custom theming.
- Correct typo in the option `identifiersAsCodeBlocks`.
- UI fixes.
- Expose docs for intersection type literals.
- Allow HTML inside code blocks.

## 4.0.0-next.12 (2023-05-17)

### Patch Changes

- Ensure unique file names for symbols with same name with `flattenOutputFiles`
- Added functionality to skip seperate index page and inject into readme.

## 4.0.0-next.11 (2023-05-13)

### Patch Changes

- Simplified fileoutput options - replaced kindsWithOwnFile option with an easier to understand `outputFileStrategy` option (see docs)
- Extract frontmatter logic into seperate TypeDoc plugin
- Fix fileoutput for 'packages' entryPointStrategy
- Tweaked header/breadcrumbs
- Escape angle brackets in comment blocks unless inside backticks ([#276](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/276))
- UI tweaks to properties display

## 4.0.0-next.10

### Patch Changes

- Fix pipes not being escaped correctly with union types in properties table
- Exposed navigation object to renderer
- General UI updates and fixes

## 4.0.0-next.9

### Patch Changes

- Discover prettier config files

## 4.0.0-next.8

### Patch Changes

- Added `numberPrefixOutput` and `hideKindPrefix` options
- Support `includeVersion`
- Decoupled renderer methods
- Further refactoring and fixes

## 4.0.0-next.7

### Patch Changes

- Added `identifiersAsCodeBlocks`, `propertiesFormat`, `typeDeclarationFormat`, `enumMembersFormat` options.
- Renamed `reflectionsWithOwnFile`=>`kindsWithOwnFile` and `groupByReflections`=>`groupByKinds`.
- General ui tweaks and fixes

## 4.0.0-next.6

### Patch Changes

- Refactored fileoutput options (renamed symbolsWithOwnFile=>reflectionsWithOwnFile, groupBySymbols=>groupByReflections)

## 4.0.0-next.5

### Patch Changes

- Fix incorrect heading levels
- Slugify output filenames
- Expose `groupBySymbols` option

## 4.0.0-next.4

### Patch Changes

- Mark final default parameters as optional ([#396](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/396))

- Run prettier on output files ([#398](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/398))

- Replace new lines in tables with `<br />` ([#331](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/331))

- TypdeDoc 0.24 compatibility fixes.

- Escape curly braces in type declarations

## 4.0.0-next.3

### Patch Changes

- Expose referenced type links on declaration
- UI fixes

## 4.0.0-next.2

### Patch Changes

- Fix optional declarations in code blocks
- Improve hierarchy output

## 4.0.0-next.1

### Minor Changes

- Expose Frontmatter options ([#384](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/384)), ([#360](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/360))
- Convert comment `@tags` to headings
- Export files following module structure as default
- UI improvemements

### Patch Changes

- Respect monorepo `readmeFile` configuration ([#383](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/383))
- Fix incorrect heading levels on project reflections

## 4.0.0-next.0

### Major Changes

Initial release of next version. In summary includes:

- Removal of handlebars.
- MDX2 support as standard ([(#305)](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/305), [(#252)](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/252)).
- Exposes additional output file options ([(#353)](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/353), [(#338)](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/338), [(#328)](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/328), [(#307)](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/307)).
- Several UI improvements.

## [3.13.4](https://github.com/tgreyuk/typedoc-plugin-markdown/compare/typedoc-plugin-markdown@3.13.3...typedoc-plugin-markdown@3.13.4) (2022-07-20)

### Fixes

- Support @typeParam comments [(#326)](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/326)

## [3.13.3](https://github.com/tgreyuk/typedoc-plugin-markdown/compare/typedoc-plugin-markdown@3.13.2...typedoc-plugin-markdown@3.13.3) (2022-07-05)

### Fixes

- Remove extraneous whitespace in tag description [(#324)](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/324)

## [3.13.2](https://github.com/tgreyuk/typedoc-plugin-markdown/compare/typedoc-plugin-markdown@3.13.1...typedoc-plugin-markdown@3.13.2) (2022-06-30)

### Fixes

- Correctly display accessors in type declaration [(#320)](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/c7fd71aa13159ee729526bdd9b7688169752da64)
- Add new line after tags [(#324)](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/324)
- Expose values to enums [(#323)](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/323)

## [3.13.1](https://github.com/tgreyuk/typedoc-plugin-markdown/compare/typedoc-plugin-markdown@3.13.0...typedoc-plugin-markdown@3.13.1) (2022-06-28)

**Note:** Version bump only for package typedoc-plugin-markdown

# [3.13.0](https://github.com/tgreyuk/typedoc-plugin-markdown/compare/typedoc-plugin-markdown@3.12.1...typedoc-plugin-markdown@3.13.0) (2022-06-27)

### Features

- TypeDoc 0.23 compatibility fixes ([f39318e](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/f39318e1a58943170282b45a6d6cd0545a80cd4a))

## [3.12.1](https://github.com/tgreyuk/typedoc-plugin-markdown/compare/typedoc-plugin-markdown@3.12.0...typedoc-plugin-markdown@3.12.1) (2022-04-21)

### Bug Fixes

- Handle non-unique anchor ids (update) ([#303](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/303)) ([2deb7b7](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/2deb7b734e6ec837aa403f4a70e01e56ccc47cc9))

# [3.12.0](https://github.com/tgreyuk/typedoc-plugin-markdown/compare/typedoc-plugin-markdown@3.11.14...typedoc-plugin-markdown@3.12.0) (2022-04-09)

### Bug Fixes

- Handle non-unique anchor ids ([#303](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/303)) ([787748f](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/787748f274d2def8fa4a1e08795a398c5a771f4f))

### Features

- Expose `preserveAnchorCasing` option ([#301](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/301)) ([f51ff45](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/f51ff45d20758a19c851c37561dd2c07e80f0c23))

## [3.11.14](https://github.com/tgreyuk/typedoc-plugin-markdown/compare/typedoc-plugin-markdown@3.11.13...typedoc-plugin-markdown@3.11.14) (2022-02-14)

### Bug Fixes

- wrap index signature output within back ticks ([#292](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/292)) ([2226322](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/22263229bf2fc9bab4fe61f03cd915f63f8e1aa4))

## [3.11.13](https://github.com/tgreyuk/typedoc-plugin-markdown/compare/typedoc-plugin-markdown@3.11.12...typedoc-plugin-markdown@3.11.13) (2022-02-05)

### Bug Fixes

- Escape pipes in comments and expand object type in props table ([#286](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/286)) ([b87c250](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/b87c2505a57035d190b8694268e658f1cd1bb426))

## [3.11.12](https://github.com/tgreyuk/typedoc-plugin-markdown/compare/typedoc-plugin-markdown@3.11.11...typedoc-plugin-markdown@3.11.12) (2022-01-18)

### Bug Fixes

- Fixed external resolution reference ([#283](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/283)) ([ba935c9](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/ba935c9eff51f5ac61a96299c437263daf07d87a))

## [3.11.11](https://github.com/tgreyuk/typedoc-plugin-markdown/compare/typedoc-plugin-markdown@3.11.10...typedoc-plugin-markdown@3.11.11) (2022-01-09)

### Bug Fixes

- Add comments for function type properties ([#281](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/281)) ([d3441f2](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/d3441f2ab12e7a025cad0fc1d08a42f8d8bc0b91))

## [3.11.10](https://github.com/tgreyuk/typedoc-plugin-markdown/compare/typedoc-plugin-markdown@3.11.9...typedoc-plugin-markdown@3.11.10) (2022-01-09)

### Bug Fixes

- Add comments for function type properties ([#281](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/281)) ([c38a095](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/c38a095ea5b8d76d1c1657a244cc0d1c33361065))
- Correctly define theme using TypeDoc `defineTheme` method ([5f2ef42](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/5f2ef422aa1bcce0698e4b923682dbb106730f45))

## [3.11.9](https://github.com/tgreyuk/typedoc-plugin-markdown/compare/typedoc-plugin-markdown@3.11.8...typedoc-plugin-markdown@3.11.9) (2022-01-05)

### Bug Fixes

- Expose missing namedAnchors option (regression) ([#277](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/277)) ([5353334](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/53533342d0b34230ae344dbe4bf8563e4899da5b))
- Watch mode compatibility ([#279](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/279)) ([da65f74](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/da65f741c38ca6a5c2fefc58c4d4fd0cbc9a6d25))

## [3.11.8](https://github.com/tgreyuk/typedoc-plugin-markdown/compare/typedoc-plugin-markdown@3.11.7...typedoc-plugin-markdown@3.11.8) (2021-12-17)

### Bug Fixes

- Fixed linked resolution ([#274](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/274))

## [3.11.7](https://github.com/tgreyuk/typedoc-plugin-markdown/compare/typedoc-plugin-markdown@3.11.6...typedoc-plugin-markdown@3.11.7) (2021-11-20)

### Bug Fixes

- Expand generic object ([#268](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/268)) ([5029a85](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/5029a8519ad840675eb3772d6c6c154228e5f4b0))

## [3.11.6](https://github.com/tgreyuk/typedoc-plugin-markdown/compare/typedoc-plugin-markdown@3.11.5...typedoc-plugin-markdown@3.11.6) (2021-11-14)

### Bug Fixes

- Catch all external references ([003cb96](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/003cb96952bbf1c7b1a651fe96903f57aca3c020))
- Fix type params with default values in params table ([7d73eff](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/7d73eff18cb919a9c1069977ebece3844528dfed))

## [3.11.5](https://github.com/tgreyuk/typedoc-plugin-markdown/compare/typedoc-plugin-markdown@3.11.4...typedoc-plugin-markdown@3.11.5) (2021-11-12)

### Bug Fixes

- Expose 'includes' and 'media' options (regression) ([#264](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/264)) ([435e0d2](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/435e0d2a3cbedbf3d935059f3f07ab3cd23d4470))

## [3.11.4](https://github.com/tgreyuk/typedoc-plugin-markdown/compare/typedoc-plugin-markdown@3.11.3...typedoc-plugin-markdown@3.11.4) (2021-11-12)

### Bug Fixes

- Added support for third party symbols ([#263](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/263)) ([e5a40d5](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/e5a40d58050cad370c82fc5ef897f8d7268e1d13))

## [3.11.3](https://github.com/tgreyuk/typedoc-plugin-markdown/compare/typedoc-plugin-markdown@3.11.2...typedoc-plugin-markdown@3.11.3) (2021-10-05)

### Bug Fixes

- correctly render reference ([#254](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/254)) ([32ce13a](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/32ce13a8f4336279ab60b1992b59ef848624560c))

## [3.11.2](https://github.com/tgreyuk/typedoc-plugin-markdown/compare/typedoc-plugin-markdown@3.11.1...typedoc-plugin-markdown@3.11.2) (2021-09-25)

### Bug Fixes

- Remove leading underscore from file names ([#248](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/248)) ([bb5e4e3](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/bb5e4e32437c367e03db6b6d4b83487b15698c6b))

## [3.11.1](https://github.com/tgreyuk/typedoc-plugin-markdown/compare/typedoc-plugin-markdown@3.11.0...typedoc-plugin-markdown@3.11.1) (2021-09-23)

### Bug Fixes

- Fix `allReflectionsHaveOwnDocument` option ([64376e9](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/64376e9bd3beb2e941d0640408ace04786db4c7e))
- Properly escape chars inside anchors ([d4e5b1d](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/d4e5b1db4dcbc21601cc3a7b6122810f9cbb9152))

# [3.11.0](https://github.com/tgreyuk/typedoc-plugin-markdown/compare/typedoc-plugin-markdown@3.10.4...typedoc-plugin-markdown@3.11.0) (2021-09-14)

### Features

- TypeDoc 0.22 compatibility fixes ([#249](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/249)) ([963250c](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/963250cbe0b12bc3f413b5138d6d4e33ad2a6353))

## [3.10.4](https://github.com/tgreyuk/typedoc-plugin-markdown/compare/typedoc-plugin-markdown@3.10.3...typedoc-plugin-markdown@3.10.4) (2021-07-20)

### Bug Fixes

- Fix anonymous function types in params table ([0047faf](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/0047faf1d3e2ec91752cef0603f2838ce1e70be9))

## [3.10.3](https://github.com/tgreyuk/typedoc-plugin-markdown/compare/typedoc-plugin-markdown@3.10.2...typedoc-plugin-markdown@3.10.3) (2021-07-12)

### Bug Fixes

- Handle TypeDoc 0.21.3 options breaking change ([2d0e7b5](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/2d0e7b507c79d26c762a763bab779796520cd7b4))

## [3.10.2](https://github.com/tgreyuk/typedoc-plugin-markdown/compare/typedoc-plugin-markdown@3.10.1...typedoc-plugin-markdown@3.10.2) (2021-06-24)

### Bug Fixes

- Fix string escape inside backticks ([3b8ab18](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/3b8ab18adda9023f79aaa6d1e377d710d8a09f38))

## [3.10.1](https://github.com/tgreyuk/typedoc-plugin-markdown/compare/typedoc-plugin-markdown@3.10.0...typedoc-plugin-markdown@3.10.1) (2021-06-23)

### Bug Fixes

- Improve type params table readability ([52038e2](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/52038e228d0dac557b9c972ab6999389d1d6132a))
- Use backticks for generics and refernce types to improve consistency ([#239](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/239)) ([1b3395f](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/1b3395f27c7d03d8d1509b9d97dcd06830ff17f5))

# [3.10.0](https://github.com/tgreyuk/typedoc-plugin-markdown/compare/typedoc-plugin-markdown@3.9.0...typedoc-plugin-markdown@3.10.0) (2021-06-18)

### Features

- TypeDoc 0.21 compatibility ([fa5e913](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/fa5e913ef238c92817761218aa77022bff8d999a))

# [3.9.0](https://github.com/tgreyuk/typedoc-plugin-markdown/compare/typedoc-plugin-markdown@3.8.2...typedoc-plugin-markdown@3.9.0) (2021-06-01)

### Features

- UI fixes and readability enhancements ([#230](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/230)) ([f4329a9](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/f4329a9c989201d69b0e54497eba4f3e6c095abc))

## [3.8.2](https://github.com/tgreyuk/typedoc-plugin-markdown/compare/typedoc-plugin-markdown@3.8.1...typedoc-plugin-markdown@3.8.2) (2021-05-26)

### Bug Fixes

- Escape leading quote in front-matter string ([#228](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/228)) ([ec38cbc](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/ec38cbc550de9e6ee319129fda96c17ab342bae5))

## [3.8.1](https://github.com/tgreyuk/typedoc-plugin-markdown/compare/typedoc-plugin-markdown@3.8.0...typedoc-plugin-markdown@3.8.1) (2021-05-11)

### Bug Fixes

- Escape double quotes inside Front Matter yaml string ([8ce2f2b](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/8ce2f2be03be6cd8d730786d48b5cd484b82ec4e))
- Fix duplicate source blocks ([616ca4e](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/616ca4e0e28431f4183c60b54fa9682c391dffe9))

# [3.8.0](https://github.com/tgreyuk/typedoc-plugin-markdown/compare/typedoc-plugin-markdown@3.7.2...typedoc-plugin-markdown@3.8.0) (2021-05-05)

### Bug Fixes

- Add space between 'Const' and signature name ([#220](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/220)) ([9400803](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/9400803a7dd0809d92c01d654e3fa75a01cb747e))

### Features

- Enforce markdownlint standards ([#219](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/219)) ([76a90bb](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/76a90bb052fa289d5b234081e45b9b40e3c7649c))
- Improve heading structure with disabled inline toc ([#222](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/222)) ([2e898ac](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/2e898ac1ec7b00a610da7d57d90a155f649d64a7))

## [3.7.2](https://github.com/tgreyuk/typedoc-plugin-markdown/compare/typedoc-plugin-markdown@3.7.1...typedoc-plugin-markdown@3.7.2) (2021-04-25)

### Bug Fixes

- Escape inherited types ([#215](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/215)) ([34c5e7b](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/34c5e7b9265a1825be567c2e89372d63c9b96f79))

## [3.7.1](https://github.com/tgreyuk/typedoc-plugin-markdown/compare/typedoc-plugin-markdown@3.7.0...typedoc-plugin-markdown@3.7.1) (2021-04-18)

### Bug Fixes

- Remove extraneous whitespace in table description col ([4e56ae4](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/4e56ae4d12be35f94ac0f7294fc67c66df04e3c1))

# [3.7.0](https://github.com/tgreyuk/typedoc-plugin-markdown/compare/typedoc-plugin-markdown@3.6.1...typedoc-plugin-markdown@3.7.0) (2021-04-17)

### Features

- Prefix table bars to beggining of lines ([064c0db](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/064c0dbecb194039d6a50d02ccc440116448c78a))
- Use backticks and quote strings for literal types ([#212](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/212)) ([8949be1](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/8949be1608e60169d1f24393bf4257e38045b059))

## [3.6.1](https://github.com/tgreyuk/typedoc-plugin-markdown/compare/typedoc-plugin-markdown@3.6.0...typedoc-plugin-markdown@3.6.1) (2021-04-05)

### Bug Fixes

- Override section of methods overriding those of classes from node modules ([cb74e83](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/cb74e83116046aebb900f25f8348a74094b03901))

# [3.6.0](https://github.com/tgreyuk/typedoc-plugin-markdown/compare/typedoc-plugin-markdown@3.5.0...typedoc-plugin-markdown@3.6.0) (2021-02-27)

### Bug Fixes

- Expand signature return types. ([a348f53](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/a348f539ec91944cbb9e5a6a9ac26bf2cff5ec21))

### Features

- Added `--hidePageTitle` option ([0b9588b](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/0b9588b4db764095b9e5e17ce004d494b92e167e))
- Added Front matter utils ([a530828](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/a5308280662b0efe5d14f03a5854d26c5e42852e))

# [3.5.0](https://github.com/tgreyuk/typedoc-plugin-markdown/compare/typedoc-plugin-markdown@3.3.0...typedoc-plugin-markdown@3.5.0) (2021-02-15)

### Bug Fixes

- Added missing class accessor labels ([2b04924](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/2b0492431c27d781a9cc869fdd26eea8259894d6))
- Include missing member type declarations ([84f5703](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/84f5703f6098f89bad7408d1fa1fb4b4d7b5dca6))
- Remove emphasis inside angle brackets ([20c9605](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/20c9605d24dd9c39b49ff84d1b813bc661bb4c3b))

### Features

- Conditionally display hierarchies ([#192](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/192)) ([099351c](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/099351cfc207718f9f577b6a8035bebe10e3fc34))
- Flatten nested params ([#191](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/191)) ([9398d5c](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/9398d5c7f51e7b1e646a15d4c06bd3056f660aa8))
- Left-align table headers ([76012ab](https://github.com/tgreyuk/typedoc-plugin-markdown/commit/76012abb7fbbd972cf8143a03bb48d21898dc5d4))

# 3.4.5 (2021-01-26)

### Bug Fixes

- Escape pipes properly ([#187](https://github.com/tgreyuk/typedoc-plugin-markdown/issues/191))

# 3.4.4 (2021-01-26)

### Bug Fixes

Fixed navigation structure when readme=none

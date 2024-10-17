# Changelog

## 2024-10-16

- Implement workaround for https://github.com/TypeStrong/typedoc/issues/2751

## 2024-10-11

- Upgrade TypeDoc from 0.25.xx to 0.26.xx
- Adjust this plugin accordingly to the breaking changes https://typedoc.org/guides/changelog/#v0.26.0-(2024-06-22)

## 2024-05-21

- Add config `hiddenFunctionParameters` to hide function parameters – e.g., `deprecatedLegacyContext`

## 2024-04-08

- Add `iframe` to the list of supported HTML tags – see function `escapeAngleBrackets()` in `src/support/utils.ts`

## 2024-03-17

- Group reflections to directories by `@group`
- Support `@groupDescription`
- Hide member inheritance and type hierarchy in member reflection

## 2024-01-17

- Support alpha and beta tags
- Remove debugging console logs
- Remove suffix from filenames

## 2023-10-16

- Switch scope to `@sisense`
- Add title to frontmatter
- Add template `project-kind`, which is index page for groups

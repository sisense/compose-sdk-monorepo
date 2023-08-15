# Contributing to compose-sdk-monorepo

We want to make contributing to this project as easy and transparent as possible.
This guide will provide you with information on how to contribute code changes to the project.
Please make sure to read this guide carefully before submitting any contributions.

To get an overview of the project, read the [README](README.md).
Here are some resources to help you get started:

- [Compose SDK Confluence Space](https://sisenseglobal.atlassian.net/wiki/spaces/SDK/overview)
- [Overview of Monorepo concept](https://monorepo.tools/)
- [Yarn package manager](https://yarnpkg.com/)

## Table of Contents

1. [Git Flow](#git-flow)
2. [Testing](#testing)
3. [TSDoc Guidelines](#tsdoc-guidelines)

## Git Flow

### General Guidelines

When making contributions to the monorepo, please follow these steps:

1. Create a new branch from the latest version of the **master** branch. Ensure that your branch name is descriptive.
   While we do not follow a specific naming convention, we usually prefix our branch name with our first name
   so all active branches are conveniently grouped by developer names in the Git Log -- for example, `tuan/fix-xyz-bug`.
2. Make your changes to the codebase. Please ensure that your changes are well-tested and documented.
   See detailed guidelines on [testing](#testing) and [documentation](#tsdoc-guidelines) below.
3. Commit your changes with a clear commit message following the structure below.
4. Create a merge request (MR) for your branch following the MR structure below.
5. After your MR is approved, you are responsible for merging it.
   You can always ask other engineers to help with merging if needed.

### Commit Message Structure

We follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) guidelines
for writing commit messages.

The commit message should be structured as follows:

```txt
<type>[(optional scope)]: <description> (SNS-xxxx)

[optional body describing commit purpose (Why) and changes (What)]

[optional footer(s)]
```

Notable requirements:

- `(SNS-xxxx)` is no longer optional. It should be included at the end of the header.
- The following types are supported:
  - `feat`: A new feature
  - `fix`: A bug fix
  - `refactor`: A code change that neither fixes a bug nor adds a feature
  - `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
  - `docs`: Documentation only changes
  - `build`: Changes that affect the build system or external dependencies (example scopes: vite, yarn)
  - `ci`: Changes to our CI configuration files and scripts (example scopes: gitlab)
  - `perf`: A code change that improves performance
  - `test`: Adding missing tests or correcting existing tests
  - `chore`: Other changes that don't modify src or test files
  - `revert`: Reverts a previous commit
- The max lengths of header, body, and footer are 100, 1000, and 100 characters, respectively.
- The header should not use 'sentence-case', 'start-case', 'pascal-case', 'upper-case' -- see invalid examples below.
- Use present tense imperative-style verbs to describe changes -- for example, `implement design options` instead of `implemented design options` or `implements design options`. See this [Stack Overflow post](https://stackoverflow.com/questions/3580013/should-i-use-past-or-present-tense-in-git-commit-messages) on this requirement.
- `commitlint` is used to enforce these requirements. See details of the rules [here](https://github.com/conventional-changelog/commitlint/blob/master/@commitlint/config-conventional/index.js).

Here are several examples of valid commit messages:

```text
feat(sdk-ui): implement design options for polar chart (SNS-75695)

**Why**
There exists BaseDesignOptionsType for polar charts but it lacks options.

**What**
Implement right sidebar options that can be applied to polar charts
```

```text
refactor!: drop support for Node 6 (SNS-50030)
```

```text
docs: update CONTRIBUTING.md to clarify commit message format (SNS-89515)
```

Here are some examples of invalid commit messages:

```text
docs: correct spelling of CHANGELOG
```

Invalid due to missing `(SNS-xxxx)`.

```text
# fails due to sentence-case
fix(SCOPE): Some message (SNS-xxxx)

# fails due to start-case
fix(SCOPE): Some Message (SNS-xxxx)

# fails due to pascal-case
fix(SCOPE): SomeMessage (SNS-xxxx)

# fails due to upper-case
fix(SCOPE): SOMEMESSAGE (SNS-xxxx)

# passes
fix(scope): some message (SNS-xxxx)

# passes
fix(scope): some Message (SNS-xxxx)
```

More details and concrete examples can be found in this [documentation](https://www.conventionalcommits.org/en/v1.0.0/).

### Merge Request (MR) Structure

The MR structure should follow the Commit Message Structure.
Specifically, the MR title and description should follow the structures of
the commit message header and body, respectively.

Note that when an MR for a branch is created, Gitlab will help us use the last commit message
to populate the MR details.

## Testing

Compose SDK testing strategy includes different approaches:
Unit Testing, UI spot checking by Storybook, API Testing, and End-to-End (E2E) Testing. See the following sub-sections for details.

### Unit Testing

- We use [Jest](https://jestjs.io/) as the test runner and test framework.
- Test files are placed in the same folder as the source files as suggested
  by [Jest](https://jestjs.io/docs/getting-started)
  -- for example, `packages/sub-repo/src/file.ts` and `packages/sub-repo/src/file.test.ts`.
  If some tests require additional helper files, they can be placed in `__test_helpers__` sub-folder in the same
  folder or in the `src` folder -- for example, `packages/sub-repo/src/__test_helpers__/helper.ts`.
- Mock files are placed in the `__mocks__` sub-folder immediately adjacent to the module as suggested by
  [Jest](https://jestjs.io/docs/manual-mocks) or in the `src` folder -- for example, `packages/sub-repo/src/__mocks__`.
- Each package sub-repo has scripts `test` and `test:coverage` in `package.json` that you can execute to run unit tests.
  The latter also generates a coverage report.
- The root folder has scripts `test` and `test:coverage:combine` that you can execute to run unit tests for all sub-repos.
  The latter also generates a combined coverage report for all sub-repos. The HTML report is located at `coverage/lcov-report/index.html`.
- We use the aggregated branch coverage as the key metric to monitor the overall unit test coverage of the monorepo.
  The current value is about [58%](https://gitlab.sisense.com/SisenseTeam/compose-sdk-monorepo/badges/master/coverage.svg?job=unit-tests&key_text=branch%20coverage&key_width=100).
  Our goal is to improve the coverage and increase the number to 80%. Help us do that
  by adding meaningful unit tests to your MRs based on the detailed coverage report.
- For each MR to the `master` branch, the `unit-tests` job of the Gitlab pipeline includes a step of calculating
  how the changes in the MR would increase or decrease the overall unit test coverage. **If the coverage decreases,
  it's the responsibility of the MR author to add unit tests to fix that.**

### Storybook

- We use [Storybook](https://storybook.js.org/) in `sdk-ui` to visually spot check Chart components. If your changes affect
  the look-and-feel of the Chart components, please make sure to check them in Storybook. You are encouraged to add new stories for your changes.
- We will explore using [Storybook for testing](https://storybook.js.org/docs/react/writing-tests/introduction) including test runner, visual tests, accessibility tests,
  etc.

### API Testing

- Currently, Compose SDK relies on the following Sisense API endpoints for handling JAQL queries
  and building the data model of a data source:
  1. `POST api/datasources/{dataSource}/jaql`
  2. `POST api/datasources/{dataSource}/fields/search`
- We write automation tests in [the automation repo](https://gitlab.sisense.com/SisenseTeam/Product/DevOps/automation/-/tree/develop/pytests/ci_dev_testing/tests/compose_sdk)
  to verify that the above endpoints work as expected.
  These tests are run nightly by Jenkins (TBU) to notify us whenever our tests fail due to changes to those endpoints.
- Test files can be shared between the automation repo and the monorepo --
  see this [MR](https://gitlab.sisense.com/SisenseTeam/compose-sdk-monorepo/-/merge_requests/206)
  for an example.
- If your changes involve additional Sisense API endpoints, consider adding tests for them to the automation repo.

### E2E Testing

We are exploring Playwright as the E2E testing framework.

(We will update this section once we have more details.
You will get extra 💛 from us if you help us start on this.)

## TSDoc Guidelines

API Documentation is crucial to Compose SDK as it helps third-party
developers to learn and use the SDK APIs.
Please pay attention to the following guidelines when writing TSDoc comments.
The goal is to make our API documentation instructive yet concise and consistent.

### Definitions and Vocabulary

_TSDoc_ is a syntax standard proposed by Microsoft for the doc comments used in TypeScript code.
While TypeScript is considered a syntactical superset of JavaScript, TSDoc does not support all JSDoc tags
and vice versa. Check out the TSDoc tags [here](https://tsdoc.org/pages/tags/alpha/).

_@microsoft/tsdoc_ package is the reference implementation of a parser for the TSDoc syntax. However, it is just
an engine and cannot be used directly. A documentation generation tool such as TypeDoc can use it
to generate the code documents.

_TypeDoc_ is a documentation generation tool that uses the `@microsoft/tsdoc` engine under the hood.
At this point, we have chosen TypeDoc to generate the API documentation for Compose SDK.
TypeDoc supports all [TSDoc tags and more](https://typedoc.org/guides/tags/).
However, as a general guideline, we should use only TSDoc-supported tags, instead of TypeDoc-specific tags,
in case we need to switch to a different tool in the future.
In our monorepo, TSDoc and TypeDoc configurations are
stored in `tsdoc.json` and `typedoc.config.cjs`/`typedoc.package.config.cjs` at the root folder.
Each package sub-repo has its own `tsdoc.json` and `typedoc.config.cjs`, which extend the root configurations.

_TypeDoc plugins_ extend TypeDoc functionalities. See `typedoc.config.cjs` for the plugins we are using.

_TypeDoc themes_ define the look and feel of the generated documentation. Our documentation
(for development reference) is using the default TypeDoc theme.

_eslint-plugin-tsdoc_ provides a rule for validating TypeScript doc comments following
the TSDoc specification. Any TSDoc-related warnings and errors related to our code changes should be fixed.

### TSDoc Generation

There are two options to generate the TSDoc documentation for Compose SDK:

```shell
yarn docs:gen
```

This first option generates the documentation for the public APIs of Compose SDK.
All internal API items are hidden as configured in the PUBLIC branch of `typedoc.config.cjs`.
This documentation is to serve public audiences.

Currently, for reference, the public docs are hosted at
http://sisenseteam.gitlab-pages.sisense.com/compose-sdk-monorepo/.
The web pages are updated automatically when code changes that would
modify the public docs are merged to the `master` branch.

```shell
yarn docs:gen:internal
```

This second option generates the documentation for all public and internal APIs of Compose SDK
as configured in the INTERNAL branch of `typedoc.config.cjs`.
Private remarks marked with `@privateRemarks` are also included.
This documentation is to serve the developers of Compose SDK and internal audiences at Sisense.

### TSDoc vs Comments

There are two types of comments, TSDoc (`/** ... */`) and non-TSDoc ordinary comments (`// ...` or `/* ... */`).

- Use `/** TSDoc */` comments for documentation, i.e. comments a user of the code should read.
- Use `// line comments` for implementation comments, i.e. comments that only concern the
  implementation of the code itself.

TSDoc comments are understood by tools such as TypeDoc, while ordinary comments are only
for us and our human co-workers.

### General Guidelines

As a general guideline, we should add TSDoc comments
for the code that third-party developers can use or reference.

Google TypeScript Style Guide has a section on
[Comments & Documentation](https://google.github.io/styleguide/tsguide.html#comments-documentation)
that we should check out and be familiar with.

### Specific Guidelines by Examples

Here we demonstrate our specific guidelines with code examples. They are far from being comprehensive so
feel free to add or suggest additional guidelines as our code grows and evolves.

#### Function and Method

```typescript
/**
 * Returns the average of two numbers. By definition, it is the sum
 * of the two numbers divided by two.
 *
 * @param x - The first input number
 * @param y - The second input number
 * @returns The arithmetic mean of `x` and `y`
 *
 */
function getAverage(x: number, y: number): number {
  return (x + y) / 2.0;
}
```

(See how such example function renders in the [TSDoc Playground](https://tsdoc.org/play#),
which you can play with.)

- Describe what the function or method does
  - Start with a third-person singular verb (e.g., `Returns...`).
  - Capitalize the first letter (`R`).
  - End the sentence with a period (.).
  - If the code logic needs more explanation, add additional full sentences -- e.g., `By definition,...`.
- Use tag `@param` to describe each of the parameters.
  - Use a single space, hyphen `-`, and another single space
    as a delimiter between the parameter name (e.g., `x`) and its noun phrase description (e.g., `The first input number`).
    The hyphen delimiter helps make the parameter description more readable.
  - Capitalize the first letter (`T`) of the param description.
  - A dot (.) is NOT needed at the end of the param description.
- Use tag `@returns` to document the return value.
  - Use a noun phrase for the description.
  - Capitalize the first letter (`T`) of the return value description.
- Markdown markups such as \`x\` can be used in TSDoc comments.

#### Interface, Type Alias, and Class

````typescript
/**
 * Mixed chart component used for easily switching chart types or rendering multiple series of different types.
 *
 * @example
 * Here's a simple example:
 * ```tsx
 * <Chart
 *   chartType={'column'}
 *   dataSet={DM.DataSource}
 *   dataOptions={{
 *     category: [DM.Commerce.AgeRange],
 *     value: [measures.sum(DM.Commerce.Revenue)],
 *     breakBy: [DM.Commerce.Gender],
 *   }}
 *   filters=[] 
 *   onDataPointClick= {(point, nativeEvent) => { console.log('clicked'); }}
 * />
 * ```
 *
 * @privateRemarks
 * The block of additional commentary that is not meant for an external audience.
 *
 * @param props - Chart properties
 * @returns Chart component representing a chart type as specified in `ChartProps.`{@link ChartProps.chartType}
 *
 */
export const Chart = (props: ChartProps) => {
  const { chartRef } = useChartEvents(props.onDataPointClick);
  // full code shortened for brevity
};
````

(See the rendering of this beloved Chart component at
http://sisenseteam.gitlab-pages.sisense.com/compose-sdk-monorepo/functions/_sisense_sdk_react.Chart.html)

```typescript
/**
 * @privateRemarks
 * This interface was added so that we would be consistent with the style options on a
 * widget. However, these are not used anywhere (yet).
 */
interface ReservedStyleOptions {
  /** @internal */
  'colors/columns'?: boolean;
  /** @internal */
  'colors/headers'?: boolean;
  /** @internal */
  'colors/rows'?: boolean;
  /** @internal */
  components?: Components;
  /** @internal */
  skin?: string;
}
```

(This interface along with its internal properties is not visible in the generated documentation.)

- Describe the interface, type, or class with a noun phrase (e.g., `Mixed chart component...`).
  - Capitalize the first letter (`M`).
  - End the noun phrase with a period (.).
  - If the code needs more explanation, add additional full sentences.
- Use tag `@example` to add an example block.
  - Code samples can be enclosed in a Markdown code fence.
- Use tag `@privateRemarks` to add a block of additional commentary
  that is not meant for an external audience. The visibility of these private remarks in the generated docs can
  be controlled by TypeDoc config option `excludeTags`.
- Use tag `@param` to describe each of the parameters -- see the guidelines on Function and Method above.
- Use tag `@returns` to document the return value -- see the guidelines on Function and Method above.
- Use tag `@internal` to indicate that an API item (e.g., parameter `colors/columns`) is not planned
  to be used by external developers. The visibility of these private remarks in the generated docs can
  be controlled by TypeDoc config option `excludeInternal`.
- Note that TypeDoc supports additional tags `@private` and `@ignore` which achieve the same goal of hiding certain
  API items in the generated docs. However, those tags are NOT supported by TSDoc and thus should be avoided.
- Tag `@link` can be used to create hyperlinks to other pages in the documentation or general internet URLs.

## Conclusion

Thank you for considering contributing to our GitLab monorepo. We appreciate your contributions and look forward to working with you!

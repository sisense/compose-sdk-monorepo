---
name: generate-release-changelog
description: Generate new release entries for CHANGELOG.md (public) and CHANGELOG_INTERNAL.md based on commits since the last release tag. Enriches each commit with Jira ticket context when available, and writes a traceability report mapping every commit to its Jira ticket and generated changelog entries.
argument-hint: <version> [release-date YYYY-MM-DD]
disable-model-invocation: true
allowed-tools: Bash(yarn release-git-log) Bash(git log*) Bash(git describe*) Bash(git show*) Bash(git tag*) Bash(git rev-list*) Bash(git remote*) Bash(date*) Bash(mkdir*) Read Edit Write ToolSearch mcp__*__jira_get_issue mcp__*__get_merge_request mcp__*__list_merge_requests
---

# Generate Release Changelog

Generate a new version section at the top of both `CHANGELOG.md` (public, customer-facing) and `CHANGELOG_INTERNAL.md` (full, internal) for the upcoming release.

Version: **$ARGUMENTS**

---

## Step 1: Collect commits and resolve version

```bash
git describe --tags --abbrev=0 --match="v*"   # e.g. v2.25.0
yarn release-git-log
```

**Resolving the version:**

- Parse `$ARGUMENTS` as `<version> [release-date YYYY-MM-DD]`.
- If version is omitted, derive the **next minor** from the last tag: `vMAJOR.MINOR.PATCH` → `MAJOR.(MINOR+1).0`. Inform the user which version was inferred before proceeding.
- If a release date is omitted, use today (UTC).

`yarn release-git-log` groups commits by conventional-commit type since the last `v*` tag. For each commit extract:

- Type (`feat`, `fix`, `refactor`, `chore`, `perf`, `style`, `docs`, `test`, `ci`, `build`, `revert`)
- Scope
- Short description
- Jira ticket ID `SNS-XXXXX` from the trailing `(SNS-XXXXX)` suffix — skip lookup for `(SNS-0)`

Ignore `chore(release): bump all packages to vX.Y.Z` and `docs: add changelog for X.Y.Z` commits.

## Step 2: Enrich commits with Jira and GitLab context

**First**, use `ToolSearch` to discover the available enrichment tools:

- Query `"jira get issue"` → note the actual tool name (e.g. `mcp__mcp-atlassian__jira_get_issue`)
- Query `"get merge request"` → note the actual tool name (e.g. `mcp__gitlab__get_merge_request`)

If no matching tool is found for a source, skip that source entirely and note it in the final report.

**Then**, run **both** enrichment sources concurrently — issue all Jira and GitLab API calls in a single message.

### Jira tickets

For each unique Jira ID, call the Jira get-issue tool with `fields="summary,description,issuetype"`.

Use the ticket `summary` and full `description` (strip markdown images `![…](…)` and bare URLs, keep all prose) to understand customer impact and phrase entries in user-visible terms. Do NOT copy Jira IDs or ticket URLs into any changelog output.

### GitLab MR descriptions

Each commit was squash-merged via a GitLab MR. The MR description often contains a human-written summary and a CodeRabbit "Summary by CodeRabbit" section.

**Extract branch names:**

```bash
git log ${LAST_TAG}..HEAD --merges --pretty=format:"%H %s"
```

Each merge commit follows `Merge branch '<branch-name>' into 'master'`. Extract `<branch-name>` from the single-quoted value. The project path comes from `git remote get-url origin` (strip `git@host:` and `.git`).

**Look up each MR** using the discovered tool with `source_branch="<branch-name>"`.

**CRITICAL: Fetch ALL MRs — do NOT skip lookups, do NOT fabricate IIDs or URLs.** If an MR was not fetched, write `— (not fetched)` in the report. Use only `iid` and `web_url` values returned by the API.

From each MR, extract:

- `iid` — for `!<iid>` in the report
- `description` — human summary + CodeRabbit bullets (`* **New Features**`, `* **Bug Fixes**`, etc.) + `Closes SNS-XXXXX` refs
- `web_url` — for the report link

**Match MRs to squash commits** by ticket ID found in both commit subject and MR title.

## Step 3: Classify each commit

Every commit always appears in `CHANGELOG_INTERNAL.md`. It also appears in `CHANGELOG.md` only when it is customer-facing. Use **all three sources** (commit, Jira, MR) together — the conventional-commit type is a hint, not a rule.

**Type signals (hints only):**

- `ci`, `build`, `test`, `style`, `chore` → strong signal for internal-only; override only when Jira/MR clearly shows user-visible impact
- `feat`, `fix`, `perf` → lean toward public, but a `feat` in a test file or a `fix` in a CI script is still internal
- When type and Jira/MR context conflict, **context wins over type**

**Package signals:**

- **Primary public packages** (`sdk-ui`, `sdk-ui-angular`, `sdk-ui-vue`, `sdk-cli`, `sdk-data`): changes here are likely public unless purely internal in nature
- **Other packages** (`sdk-ui-preact`, `sdk-query-client`, `sdk-rest-client`, `sdk-modeling`, `sdk-pivot-*`, `sdk-plugins`, `sdk-shared-ui`, `sdk-tracking`, etc.): publicly available but default to **internal-only** unless Jira/MR confirms observable user-facing impact

**Always internal-only:**

- CI/build/test/lint infra, mock moves, pipeline fixes, release tooling
- Refactors with no user-visible behavior change
- Internal packages not published at all (e.g., `analytics-composer`, `nlq-v3-translator`, tooling)
- Features behind internal flags — add `(internal testing)` suffix in the PUBLIC file only for opt-in previews discoverable by customers; otherwise keep internal

When uncertain, prefer internal-only and flag in the final report.

## Step 4: Categorize each entry

Both files use these sections in order:

- `### Added` — new capabilities (new components, hooks, options, APIs)
- `### Changed` — fixes, improvements, behavior changes, deprecations, and **breaking changes**

No separate `### Deprecated` or `### Removed` sections — fold those into `### Changed`.

**For major versions**, prefix breaking items with `**Breaking:**`:

```md
### Changed

- **Breaking:** The minimum supported version of Angular is now v17
- **Breaking:** Remove deprecated methods from `WidgetModel` API
- Fix double toggle on the checkbox in multi-selection filters
```

## Step 5: Write entries in the repo's voice

Scan the last ~5 versions of both files before drafting. Key conventions:

- Present-tense imperative verbs: `Add`, `Fix`, `Improve`, `Extend`, `Support`, `Enable`, `Prevent`
- Sentence case; end without a period
- Backticks around code identifiers: `` `PieChart` ``, `` `onDataPointClick` ``, `` `sdk-ui-angular` ``
- Group 3+ related items under a nested header:
  ```
  - `PivotTable` improvements:
    - Add drilldown support
    - Add `autoHeight` style option
  ```
- Public file: user-visible phrasing. Internal file: technical phrasing allowed.
- Do NOT include commit hashes, Jira IDs, author names, file paths, or emojis.

## Step 6: Version header

```md
## [X.Y.Z] - YYYY-MM-DD
```

Insert immediately after the top `# Changelog` heading, above the previous version.

## Step 7: Write both files

Use `Edit` with the current top version header as anchor — never overwrite existing entries.

```
 # Changelog

+## [X.Y.Z] - YYYY-MM-DD
+
+### Added
+- …
+
+### Changed
+- …
+
 ## [previous-version] - …
```

## Step 8: Write the traceability report

**Output path:** `.reports/changelog-release.md` — always overwrite. Create `.reports/` if missing.

**Jira link format:** Use the base URL observed in fetched ticket descriptions (typically `https://sisenseglobal.atlassian.net/browse/SNS-XXXXX`). Write `_no ticket_` for missing or `SNS-0` IDs. Never invent a base URL.

```md
# Release Report — <X.Y.Z> (<YYYY-MM-DD>)

## Summary

- Commit range: `vPREV..HEAD`
- Total commits: N
- Public entries: X
- Internal-only entries: Y
- Excluded commits: Z
- Enrichment: Jira <available|unavailable>, GitLab MR <available|unavailable>

## Commits

### `<short-sha>` <type>(<scope>): <subject>

- Jira: [SNS-XXXXX](url) — <ticket summary> (<issue type>)
- MR: [!<iid>](web_url) — <MR title> _(or `— (not fetched)`)_
- Classification: **public** | **internal-only** | **excluded**
- Public entry: <exact bullet text> _(or `—`)_
- Internal entry: <exact bullet text> _(or `—`)_
- Notes: <classification reason; borderline flags; fetch errors>
```

Rules:

- One section per commit, in `yarn release-git-log` order. Never collapse commits.
- Entry text is plain prose — do NOT wrap it in outer backticks.
- Quote generated bullets verbatim. For nested bullets, prefix the parent header in parentheses.
- Excluded commits still get a section with `excluded` and a Notes line explaining why.
- **NEVER fabricate MR IIDs or URLs.**

## Step 9: Final report message

Output:

- Version and date used (and whether version was inferred or provided)
- Commit range and total count
- Public vs internal-only entry counts
- Path to the report (`.reports/changelog-release.md`), for review only
- Excluded commits list
- Borderline classifications needing human review, with reasons
- Which enrichment sources were available/unavailable

Do NOT run `git commit`.

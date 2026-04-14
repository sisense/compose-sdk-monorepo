---
name: review-mr
description: Review the current branch against MR conventions: commit format, no Sisense internals in source, code quality rules, and testing requirements.
allowed-tools: Bash(git log *) Bash(git diff *) Bash(git show *) Bash(git status *)
---

# Review Merge Request

## Branch context

Commits on this branch:

```text
!`git log origin/master..HEAD --oneline`
```

Changed files:

```text
!`git diff origin/master...HEAD --stat`
```

---

## Check 1: Commit messages

Format: `<type>[(scope)]: <description> (SNS-xxx or ONYX-xxx)`

Run to inspect full messages:

```bash
git log origin/master..HEAD --format="%H %s"
```

**Valid types:** `feat`, `fix`, `refactor`, `style`, `docs`, `build`, `ci`, `perf`, `test`, `chore`, `revert`

**Rules** (enforced by `.commitlintrc.cjs`):

- Header max 100 characters
- Jira ticket `(SNS-\d+)` or `(ONYX-\d+)` required at end of header
- Lowercase after the colon — no sentence-case, start-case, pascal-case, or upper-case
- Present tense imperative verbs: `add`, `fix`, `implement` — not `added`, `fixes`, `implementing`
- Scope is optional; can be shortened: `sdk-ui` → `ui`

**Valid:** `feat(ui): add waterfall chart component (SNS-12345)`
**Invalid:** `feat(ui): Add waterfall chart (SNS-12345)` ← capital A

---

## Check 2: No Sisense internals in source files

The repo is mirrored to public GitHub. Jira refs are OK in commit messages but **not in source code**.

Read the diff and flag any of the following in `.ts`/`.tsx`/`.js` files:

```bash
git diff origin/master...HEAD -- '*.ts' '*.tsx' '*.js'
```

- JIRA ticket patterns in code: `SNS-\d+`, `ONYX-\d+`
- Developer name patterns: `// TODO <Name>:`, `// FIXME <Name>`
- Internal service names: `PWC`, `PrismWebClient`, `ElastiCube`
- Opinionated comments: `// This doesn't make sense but...`

---

## Check 3: Code quality

Scan the diff for:

**No unsafe `any`** — allowed only with a justification comment:

```ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- <reason>
```

**No barrel imports:**

- `import { debounce } from 'lodash-es'` → must be `import debounce from 'lodash-es/debounce'`
- `import { Button } from '@mui/material'` → must be `import Button from '@mui/material/Button'`

**TSDoc on new public API exports** in `packages/sdk-ui/src/public-api/` — must carry the barrel's required tag (`@beta`, `@alpha`, `@internal`, `@sisenseInternal`).

**Functional programming** — no input mutation; use `flow` from `lodash-es/flow` for pipelines.

---

## Check 4: Testing

- New UI components in `sdk-ui` need a Storybook story (`*.stories.tsx`) colocated with the component
- Test files colocated: `foo.ts` → `foo.test.ts`
- New features need unit tests; coverage must not decrease overall

---

## Check 5: MR title

The MR title follows the commit header format: `<type>[(scope)]: <description> (SNS-xxx)`

---

## Output

Report findings grouped by category with file paths and line numbers where applicable. End with:

```text
COMMIT MESSAGES:    ✓ / ✗ (n issues)
SISENSE INTERNALS:  ✓ / ✗ (n issues)
CODE QUALITY:       ✓ / ✗ (n issues)
TESTING:            ✓ / ✗ (n issues)
OVERALL: Ready to merge / Needs fixes
```

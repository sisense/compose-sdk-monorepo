---
name: safe-refactor
description: >
  Execute a large, multi-step refactoring safely. Covers the full lifecycle:
  scope mapping, characterization tests + snapshots before touching code,
  atomic step-by-step implementation with a verification gate after each step,
  and a final regression pass. Use when a refactoring touches many files,
  carries high regression risk, or must provably preserve observable behavior.
argument-hint: <refactoring-plan-path or description>
disable-model-invocation: true
allowed-tools: 'Read Glob Grep Bash(git status|git log|git show|git diff|git add|git commit) Write Edit TodoWrite Agent(refactor-worker)'
---

# Safe Large-Scale Refactoring

Target: **$ARGUMENTS**

---

## Orchestrator vs. Agent Split — MANDATORY

This skill uses two tiers. You (the orchestrator) run with the most capable model
and own every decision that requires judgment. The **refactor-worker** subagent
(Sonnet) handles every task that is well-defined enough to execute mechanically.

| Tier                   | Model          | Owns                                                                                                                                                          |
| ---------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Orchestrator** (you) | Best available | Phase 1 scope analysis; seam definitions; step sequencing; adapting the plan when code diverges; reviewing agent results; snapshot judgments; all git commits |
| **refactor-worker**    | `sonnet`       | Writing characterization tests for a _specified_ seam; implementing a _specified_ step; running verification gates and reporting results                      |

**CRITICAL: You MUST delegate implementation work to the `refactor-worker` subagent.**
Do NOT implement steps yourself. Your job is to construct briefs, spawn the agent,
review results, and commit. The only code you write directly is:

- High-risk regression tests (Phase 3 risk protocol)
- Small fixes when an agent's output needs a one-line correction
- Working-notes updates

If you find yourself writing more than 5 lines of production code, STOP and
delegate to `refactor-worker` instead.

**Rule:** Never spawn an agent without giving it a self-contained brief. The agent has
no conversation history. Every brief must include: what to do, which files to read,
what the current code does, what the target state is, and what to report back.

**Rule:** The orchestrator always reviews agent results before committing. An agent
that reports green does not automatically get committed — you verify and commit.

---

## Orientation

A large refactoring fails in one of two ways: regressions that slip through because
there was no safety net, or a half-finished state that cannot be merged or rolled back.
This skill prevents both by enforcing four sequential phases with hard exit gates.

| Phase              | Goal                                                   | Exit gate                         |
| ------------------ | ------------------------------------------------------ | --------------------------------- |
| **1 — Map**        | Understand every touch-point before writing a line     | Written scope doc                 |
| **2 — Safety Net** | Tests + snapshots that pass on _unmodified_ code       | Green CI on current code          |
| **3 — Implement**  | One atomic step at a time; green gate after every step | Every step committed and verified |
| **4 — Close**      | Full regression pass; snapshot diff reviewed           | Zero unreviewed changes           |

**First action:** look for an existing working-notes file near the code being changed
(e.g., `__dev-docs__/<name>-working-notes.md` or a `REFACTORING.md` in the package root).

- **File found** → read it, find the last completed step, resume from the next step in Phase 3.
- **No file** → start at Phase 1.

---

## Phase 1 — Map the Scope

> **Orchestrator only.** This phase requires reading unfamiliar code, exercising
> judgment about risk, and producing the working notes that all subsequent agents
> depend on. Do not delegate.

> Skip if working notes already contain a completed scope map.

### 1.1 Ingest the plan

If `$ARGUMENTS` is a file path, read the document in full.
If it is a description, derive the scope by reading the codebase — search for all
call sites, type references, and import paths affected by the change.

### 1.2 Enumerate affected files

For every file that will change, record:

- **Why** it is affected (owns the abstraction being replaced, imports a renamed symbol,
  implements a contract being changed, contains a test for affected logic, etc.)
- **Risk level** using this rubric:

| Level      | Indicators                                                                                                                                                                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **High**   | Public / exported API change; ownership of shared mutable state transferred; cross-module contract altered (events, serialization format, network shape); behavior at a system boundary (I/O, external service, persistence layer) |
| **Medium** | Internal wiring replaced (one provider swapped for another); side-effect ownership moved; internal function signature changed; integration between two modules adjusted                                                            |
| **Low**    | Rename; import path update; file move with re-export shim; test file adjustment; comment or doc update                                                                                                                             |

### 1.3 Identify integration seams

A seam is anything a caller can _observe_ that must not change after the refactoring.
List every seam in the affected scope:

- **Public API** — exported function signatures, class interfaces, module entry points
- **Callbacks and events** — what is called, when, and with what arguments
- **Return shapes** — the structure of values returned by public functions or hooks
- **Persistence** — file formats, database schemas, cache keys, serialized field names
- **Error contracts** — which errors are thrown/returned, under which conditions
- **Side effects** — what external systems are touched, in what order, with what payloads
- **Dev-mode invariants** — warnings and errors produced only in development

### 1.4 Order steps: least risky first

Sequence the plan steps so that:

1. Purely additive work comes first (new files, new types — cannot break anything).
2. High-risk steps come after the safety net is confirmed.
3. Deletion of old code comes last — only after the new path is exercised and verified.

If the plan already has a fixed order, annotate each step with its risk level.

### 1.5 Write the working-notes file

The working notes are the single source of truth shared between sessions and agents.
Write them now; all subsequent agents will receive excerpts from this file in their briefs.

```markdown
# <Refactoring Name> — Working Notes

## Scope Map

### Affected files

| File | Reason | Risk |
| ---- | ------ | ---- |
| ...  | ...    | ...  |

### Integration seams (must not change)

<!-- For each seam: name, type, files involved, what observable output to assert -->

- Seam A [Callback]: `onChange` in `foo.ts` — fires with `{ value }` when bar changes
- Seam B [Return shape]: `useWidget()` returns `{ id, title, isLoading }`
- ...

## Step Plan

<!-- Risk level in brackets; enough detail that an agent can execute the step solo -->

- [ ] Step 1 [Low]: <precise description — what to add, what to change, what to delete>
- [ ] Step 2 [Medium]: ...
- [ ] Step 3 [High]: ...

## Safety Net Status

<!-- Updated at the end of Phase 2 -->

## Session Log

<!-- One line per completed step: "YYYY-MM-DD — Step N done: <what changed>" -->
```

---

## Phase 2 — Safety Net

> **Orchestrator decides; agents write.** You audit coverage and define each seam
> precisely enough for an agent to write a test for it. Agents do the writing.
> You verify every test on the unmodified codebase before Phase 3 begins.

> Skip if working notes say `Safety net: COMPLETE`.

### 2.1 Audit existing test coverage

For each seam from 1.3, check whether an existing test covers it:

- Already covered by a test that asserts observable output (not internals) → mark it, skip agent spawn.
- Not covered, or only covered by implementation-detail assertions → spawn an agent.

### 2.2 Spawn one `refactor-worker` per uncovered seam

For each uncovered seam, spawn a `refactor-worker` subagent with this brief structure:

```
You are writing a characterization test — a test that captures the current, correct
behavior of existing code so that a future refactoring cannot break it silently.

## Seam to cover
<paste the seam description from the working notes>

## Files to read first
<list the source file(s) and any existing test file(s) for this seam>

## What the test must assert
<paste the "What to assert" row from the seam coverage table — be specific>
- Assert observable output only (return value, emitted event, written file, thrown error).
- Do NOT assert which internal function was called or which code path was taken.

## Where to write the test
<test file path — colocate with source per project convention>

## Constraints
- Test must pass on the CURRENT unmodified codebase.
- Use realistic, non-trivial inputs (not empty objects or all-default values).
- Follow the project's existing test style (check nearby *.test.* files for patterns).

## Report back
- The test file path and test name(s) written.
- Whether the test passes when run: <test command for this file>.
- Any assumption you had to make because the seam description was ambiguous.
```

Spawn independent seam agents in parallel where seams do not share a test file.
Seams that write to the same test file must be serialized (spawn sequentially).

### 2.3 Snapshot agents

For seams that produce large structured outputs, spawn an additional agent whose
sole job is to add snapshot assertions:

```
Add snapshot tests for the following integration seam(s):
<seam list>

Read these files first: <source files>
Use the project's snapshot mechanism (e.g., toMatchSnapshot(), inlineSnapshot, or
golden file). Capture realistic output — not empty/trivial inputs.

The tests must pass on the CURRENT unmodified code. Report the file path and
whether the snapshot was written successfully.
```

### 2.4 Review and confirm

After all seam agents complete:

1. Read each test file they wrote.
2. Verify the assertions test observable behavior, not internals.
3. Run the full test suite for the affected package yourself:

```bash
<test command for affected package>
```

Zero failures, zero unexpected snapshot changes required.

Update working notes: `Safety net: COMPLETE — <N> tests added, <M> snapshots captured`.

---

## Phase 3 — Atomic Implementation

> **Orchestrator orchestrates; agents implement.** You construct the brief for each
> step from the working notes, spawn the agent, review its result, run the commit
> gate yourself, and only then advance to the next step.

For every step in the plan (in order):

### 3.A Construct the step brief (orchestrator)

Read the step description from the working notes. Read the files the step will touch
to verify the plan is still accurate. If the plan is stale, update the working notes
before briefing the agent.

Build the agent brief:

```
You are implementing one atomic step of a larger refactoring. Your scope is strictly
limited to this step — do not fix adjacent issues, clean up unrelated code, or
implement anything from later steps.

## Step description
<exact step text from working notes, including risk level>

## Files to read first
<list every file the step will touch, plus the working-notes file>

## Current behavior (what the code does now)
<1–3 sentence summary of the relevant code paths — synthesized by you from your read>

## Target behavior (what it should do after this step)
<1–3 sentence description of the post-step state>

## Strangler-fig order within this step
1. Add — new files/types first (cannot break anything).
2. Wire — connect new code; keep old code alive.
3. Remove — delete old code only after wiring is in place.

## Verification gate
After all changes, run these commands and report the output of each:
  <static analysis command>
  <test command for affected package>
  <lint command>
All three must be green. If any fail, fix within this step's scope before reporting.

## Report back
- List of files changed and a one-line summary of each change.
- Output of each verification command (pass/fail + any error lines).
- Any assumption or deviation from the plan (ambiguity encountered, etc.).
- Do NOT commit — the orchestrator commits after reviewing your report.
```

### 3.B Spawn the step agent

Use the Agent tool to spawn a `refactor-worker` subagent. Pass the brief from 3.A
as the prompt. The `refactor-worker` definition already sets `model: sonnet`.

Example invocation (the Agent tool accepts these parameters):

- **agent_type**: `refactor-worker`
- **prompt**: the full brief text from 3.A
- **description**: `Step N: <step name>`

Spawn one agent per step. Do not run step agents in parallel — each step's output
is the input to the next step's starting state.

### 3.C Review the agent's result (orchestrator)

When the agent reports back:

1. Read each file it changed.
2. Confirm the verification gate was green (re-run if the agent's output is ambiguous).
3. If the gate was red and the agent couldn't fix it: diagnose yourself, fix, re-run gate.

### 3.D Commit (orchestrator)

Stage only the files changed in this step:

```bash
git add <specific files>
git commit -m "refactor(<scope>): <step description> (<TICKET>)"
```

One step = one commit. Update working notes: check the step off, append session log line.

### 3.E Repeat

Proceed to the next unchecked step. If ending a session mid-refactoring, the
working-notes file and the committed history are sufficient to resume next session.

---

## Phase 4 — Close

> **Orchestrator reviews; agents run.** Spawn agents for the mechanical checks;
> you make every accept/reject judgment on changed snapshots and unexpected failures.

Run after all steps are checked off.

### 4.1 Spawn a full-suite `refactor-worker`

Spawn a `refactor-worker` with this brief:

```
Run the complete project test suite: <full project test command>
Collect all output. Report:
- Total pass/fail counts.
- Names of any failing tests with their error messages.
- Any snapshot changes (updated, written, or obsolete).
- Do not fix anything — report only.
```

Review the report. Zero failures expected. Any failure not caught by the per-step
gate means the gate was too narrow — fix and add the missing test yourself.

### 4.2 Review snapshot changes (orchestrator)

For every snapshot change reported in 4.1, make an explicit decision:

- **Intentional** (the refactoring purposely changed this output) → update the snapshot;
  note the reason in the commit message.
- **Unintentional** → regression; investigate and fix before closing.

No snapshot change is accepted silently.

### 4.3 Spawn a static analysis `refactor-worker`

Spawn a `refactor-worker` with this brief:

```
Run full-workspace static analysis: <workspace type-check command>
Report all errors. Do not fix — report only.
```

Review output. Fix any errors yourself.

### 4.4 Spawn a contract verification `refactor-worker` (if applicable)

Spawn a `refactor-worker` with this brief:

```
Run the project's contract verification tools
(public API checks, OpenAPI validation, schema audits, etc.):
  <contract verification command(s)>
Report all violations. Do not fix — report only.
```

### 4.5 Spawn a dependency check `refactor-worker` (if modules were moved)

Spawn a `refactor-worker` with this brief:

```
Check for circular dependencies introduced by the refactoring:
  <dependency graph tool — e.g. madge, depcruise, go mod graph>
Report any new cycles. Do not fix — report only.
```

### 4.6 Performance contracts (orchestrator, if applicable)

If the refactoring touched a hot path or render-critical component, verify
performance contracts have not regressed:

- UI: profile for unintended extra renders
- Backend: re-run benchmarks if the project maintains them
- Build: verify bundle size delta is acceptable

### 4.7 Final commit (orchestrator)

```bash
git commit -m "test(refactor): finalize <refactoring name> — update snapshots (<TICKET>)"
```

Mark working notes: `Refactoring COMPLETE — <YYYY-MM-DD>`.

---

## Risk-Level Protocols

Apply additional steps based on risk level from Phase 1.

### High-risk steps

**Before spawning the step agent:**

- Write a dedicated regression test yourself (not delegated) that would catch the
  specific failure mode this step introduces (lost event, stale value, broken
  ownership handoff, cross-module contract violation).
- Add the test to the step brief so the agent verifies against it.

**After the agent reports back:**

- Re-read the changed files yourself — do not rely solely on the agent's summary.
- Trace through the risk scenario manually in the test.
- Do not batch this step with any other in the same commit.

### Medium-risk steps

- Confirm the brief includes an existing or new test that exercises the changed path end-to-end.
- After the agent reports, verify all consumers of the changed interface compile.

### Low-risk steps

- Standard brief + gate is sufficient. No additional orchestrator review required beyond reading the diff.

---

## Checklist Summary

**Phase 1 (orchestrator):**

- [ ] Plan read and fully understood
- [ ] All affected files enumerated with risk levels
- [ ] Integration seams listed with observable output defined per seam
- [ ] Steps ordered least-risky-first with risk annotations
- [ ] Working notes file created

**Phase 2 (orchestrator + agents):**

- [ ] Existing test coverage audited per seam
- [ ] One `refactor-worker` spawned per uncovered seam; tests written
- [ ] Snapshot agents spawned for rich structured outputs
- [ ] All new tests pass on unmodified code (orchestrator verified)
- [ ] Working notes: `Safety net: COMPLETE`

**Phase 3 (per step):**

- [ ] Plan still accurate for this step (orchestrator verified)
- [ ] Step brief constructed with context, target, and gate commands
- [ ] `refactor-worker` subagent spawned (model: sonnet is baked into the definition)
- [ ] Agent result reviewed by orchestrator
- [ ] Gate green (re-run by orchestrator if needed)
- [ ] Step committed by orchestrator (one commit per step)
- [ ] Working notes updated

**Phase 4 (orchestrator + agents):**

- [ ] Full-suite `refactor-worker` run; report reviewed
- [ ] Every snapshot change decided (intentional vs regression)
- [ ] Static analysis `refactor-worker` run; errors fixed
- [ ] Contract verification `refactor-worker` run (if applicable)
- [ ] Dependency check `refactor-worker` run (if modules moved)
- [ ] Performance contracts verified (if applicable)
- [ ] Working notes: `Refactoring COMPLETE`

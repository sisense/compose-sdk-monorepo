---
title: AI-Driven Development
hidden: true
---

# AI-Driven Development

Build Sisense widget plugins faster with any AI coding agent. Every plugin project scaffolded by `create-plugin` includes a complete AI development environment — an `AGENTS.md` context file, reference docs in `.claude/docs/`, and pre-approved tool permissions. Describe your goal in plain language and the agent implements it using the correct SDK patterns without needing to read the SDK source. Type errors are caught automatically after every file edit and fixed in the same turn.

> **Prerequisite:** Scaffold a plugin project first. See the [Quick Start](./plugin-devx-quickstart.md).

---

## What's Included

Every plugin project contains a `.claude/` folder with AI context and reference material:

| Path                              | What it does                                                                                                                               |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `AGENTS.md`                       | Primary context file — loaded automatically by Claude Code, Cursor, Windsurf, and other AI coding agents on every session                  |
| `.claude/docs/`                   | Detailed guides for visualization, data fetching, data model, data panel, design panel, and event handling                                 |
| `.claude/docs/hooks-reference.md` | All hooks and utilities from `@sisense/sdk-ui`                                                                                             |
| `.claude/docs/types-reference.md` | All SDK types used in plugin development                                                                                                   |
| `.claude/docs/errors.md`          | Common runtime, TypeScript, build, and deployment errors with fixes                                                                        |
| `.claude/settings.json`           | _(Claude Code only)_ Pre-approved tool permissions and a hook that runs TypeScript type checking after every file edit                     |
| `.claude/skills/design-custom-widget/` | _(Claude Code only)_ `/design-custom-widget` skill — explicitly triggers the full implementation flow                                                     |
| `.claude/commands/deploy.md`      | _(Claude Code only)_ `/deploy` command — pre-flight checks then upload to Sisense Fusion                                                   |

---

## Getting Started

### 1. Open the project

Open the scaffolded plugin folder in your editor or terminal.

### 2. Describe your goal

Tell the AI what you want to build in plain language:

```
I want to build a bar chart showing revenue by product category with cross-filtering.
```

With Claude Code you can also invoke the `/design-custom-widget` skill directly, which triggers the same flow explicitly. Either way, the agent reads your source files automatically, then asks any remaining questions it needs (all at once):

- What does the visualization show? (if not already described)
- Will users cross-filter other widgets by clicking?
- Do you have a preferred charting library?
- Will users configure visual styling from the widget editor sidebar?

From your answers, it implements everything in a single step: data inputs, library install, `Visualization.tsx`, cross-filtering, resize handling, style controls, and a final `tsc` + lint check. No follow-up commands needed.

---

## Claude Code Commands

For Claude Code users, two commands are available as shortcuts:

| Command                  | What it does                                                                                                                                                                                          |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/design-custom-widget`  | Explicitly triggers the full implementation flow — reads source files, asks clarifying questions, implements everything: data inputs, library, chart code, resize observer, style controls, type checks |
| `/deploy`                | Pre-flight checks (env, types, lint) then build and deploy to Sisense Fusion                                                                                                                          |

These commands are optional — describing your goal in plain language works just as well. For all other tasks (adding cross-filtering, style options, data inputs, tooltips, number formatting, debugging) plain language is the only path regardless of agent.

---

## Typical Workflow

The typical path from empty project to deployed plugin:

1. **Describe your visualization goal** — the agent reads your source files, asks a few questions, and implements everything in one step
2. **Extend incrementally** — describe additions in plain language: "add cross-filtering", "add a color style option", "add a second data input"
3. **Deploy** — ask the agent to deploy, or run `npm run deploy` directly

With Claude Code, steps 1 and 3 can be triggered explicitly with `/design-custom-widget` and `/deploy`.

---

## Tips for Effective AI Collaboration

**Include input names in your goal description.** If the default `category`/`value` names don't match your chart's semantics, say so upfront — the agent renames them as part of the implementation. Example: "a scatter plot with x and y axes and a breakBy dimension".

**One goal per session.** Starting fresh? Describe the full chart and the agent implements everything. Already have a working plugin? Describe one addition at a time — "add cross-filtering", "add a color style option", "add a second dimension input" — and it follows the right guide automatically.

**Ask the AI to debug when something looks wrong.** Blank widget, ignored clicks, incorrect values — tell it "debug the plugin" and it checks all 11 common root causes and reports the exact file and fix. It's faster than reading `errors.md` manually.

**Keep conversations focused.** AI agents work best when each conversation has a clear goal. "Add cross-filtering" is better than "make the chart interactive and also improve the design panel and fix the deploy." One feature per conversation gives more targeted results.

---

## Further Reading

- [Quick Start](./plugin-devx-quickstart.md) — scaffold, setup, and deploy from scratch
- [Widget Plugins Tutorial](../00-widget-plugins-tutorial.md) — deep-dive into visualization, data fetching, data panel, design panel, and event handling
- [Plugin DevX Reference](./plugin-devx-reference.md) — full CLI options, project structure, testing, framework integration

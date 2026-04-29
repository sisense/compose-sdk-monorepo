---
name: generate-release-notification
description: Generate two Slack notification drafts for the latest Compose SDK release — a changelog-style message and a marketing-style message. Always reads the most recent entry from CHANGELOG.md. Optionally sends formatted drafts via Slack if a Slack MCP connection is available in the current session.
disable-model-invocation: true
allowed-tools: Read ToolSearch
---

# Generate Release Notification

---

## Step 1: Extract the latest release from CHANGELOG.md

Read `CHANGELOG.md` (project root). Extract the **first** release section — everything from the first `## [X.Y.Z] - YYYY-MM-DD` header up to (but not including) the next `## [` header. Record:

- **Version**: e.g., `2.25.0`
- **Release date**: e.g., `2026-04-14` → also format as `April 14, 2026` for display
- **All `### Added` and `### Changed` bullets**, preserving any nested sub-bullets exactly as written

---

## Step 2: Compose both notification texts

Prepare a **plain** (preview) and a **formatted** (Slack draft) version of each. Do not output anything yet.

---

### Changelog-style message

**Plain version** — no icons, no markup, `-` bullets, no backticks:

```
Compose SDK <release-type> version X.Y.Z released:
[X.Y.Z] - YYYY-MM-DD
Added
- <bullet>
Changed
- <bullet>
  - <nested bullet if present in CHANGELOG.md>
```

**Formatted version:**

```
:ship: **Compose SDK <release-type> version X.Y.Z released:**
**[X.Y.Z] - YYYY-MM-DD**

**Added**
• <bullet>

**Changed**
• <bullet>
  • <nested bullet, indented with 2 spaces, if present in CHANGELOG.md>
```

Rules:

- `<release-type>`: minor number changed → `minor version`; only patch changed → `patch version`
- Reproduce the bullet structure from CHANGELOG.md faithfully — if a bullet has nested sub-bullets there, keep them nested here too (do not flatten)
- Preserve backtick-wrapped code identifiers (e.g. `` `sdk-ui` ``)
- Always put a blank line between a section header and the bullet list below it, and between a bullet list and the next section header — this prevents Slack from misaligning sections

---

### Marketing-style message

**Plain version** — no icons, no markup, `-` bullets:

```
Compose SDK X.Y.Z is here!
<one-sentence summary of the key themes>
Why:
<1-2 sentences on motivation — what customer problem this solves>
Released on Month D, YYYY
What's New in X.Y.Z
- <bullet>
- <bullet>
Full changelog: https://developer.sisense.com/guides/sdk/CHANGELOG.html#_X-Y-Z-YYYY-MM-DD
```

**Formatted version:**

```
:ship: **Compose SDK X.Y.Z is here!**
<one-sentence summary>
:bulb: **Why:**
<motivation>
:hourglass_flowing_sand: **Released on Month D, YYYY** :tada:

**What's New in X.Y.Z**
• <bullet>
• <bullet>

Check out the full [changelog](https://developer.sisense.com/guides/sdk/CHANGELOG.html#_X-Y-Z-YYYY-MM-DD) for all details and fixes included in Compose SDK X.Y.Z. :rocket:
```

Rules for "What's New" bullets:

- Use plain `•` bullets — no emoji per item
- Number of bullets reflects the valuable features in this release; combine related
- Only use a `• Stability & fixes:` grouped bullet when there are multiple minor fixes that are not worth listing individually — skip it if all fixes are already covered by feature bullets, or if there are very few fixes
- Write in a friendly, benefit-focused tone (explain what the user gains, not just what changed)
- Features tagged "(internal testing)" in the changelog keep that qualifier

Changelog URL anchor: replace dots in version with dashes, keep date dashes, prepend `_`:

- e.g. `2.25.0` + `2026-04-14` → `#_2-25-0-2026-04-14`

---

## Step 3: Output the plain-text previews

Print both plain versions in labelled code blocks:

═══════════════════════════════════════════════
CHANGELOG-STYLE
═══════════════════════════════════════════════

```
<plain changelog-style>
```

═══════════════════════════════════════════════
MARKETING-STYLE
═══════════════════════════════════════════════

```
<plain marketing-style>
```

═══════════════════════════════════════════════

---

## Step 4: Offer to send a formatted Slack draft

### Discover the Slack tool

Use `ToolSearch` with query `slack send message` to find an available Slack send tool. The tool name will vary per user (e.g. `mcp__<id>__slack_send_message`) — use whatever is returned. Load its schema before calling it.

### If a tool IS found

Ask the user:

> The draft will be sent to Slack with full formatting applied (icons, bold headings, bullet points, clickable changelog link).
> Where should I send it? I can send it to your personal DM by default — or name another channel or person.

If the user's Slack user ID is already known from the conversation, propose their personal DM by name. Otherwise ask for their Slack username or user ID before sending.

Once confirmed, send both formatted messages as a **single Slack message** with this layout:

```
_Draft — please review before posting_


*── Changelog-style ──*

<formatted changelog-style message>


*── Marketing-style ──*

<formatted marketing-style message>
```

Use two blank lines before and after each section to give the message visual breathing room.

After sending, share the message link.

**If the send fails with a connection error:** tell the user the Slack MCP connection dropped and suggest opening a fresh Claude Code session — the MCP connection will be re-established on startup. Do not retry in a loop.

### If NO tool is found

Tell the user:

> This skill can also send a formatted Slack draft (with icons, bold, and a proper changelog link) directly to a channel or DM of your choice — but no Slack MCP connection is configured in this session. To enable it, add a Slack MCP connection and re-run the skill.

Do NOT attempt to send anything via Slack in this case.

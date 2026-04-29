// @ts-check
/**
 * Source-file scanner for the tag-report plugin.
 *
 * Scans original .ts/.tsx files directly (rather than TypeDoc's compiled model)
 * so that tagged declarations are found regardless of whether they are publicly
 * exported.  A separate filter step (see exports-resolver.cjs) trims the results
 * to only those reachable from each package's entry point.
 *
 * Main export: scanSourceFiles(absDirs) → TaggedDecl[]
 */

'use strict';

const fs = require('fs');
const { execSync } = require('child_process');
const { TAGS_TO_REPORT, REPO_ROOT } = require('./config.cjs');

// ── Declaration patterns ──────────────────────────────────────────────────────

/**
 * Ordered list of [regex, kindLabel] pairs used to identify the name and kind
 * of a declaration from a single trimmed source line.
 * The first match wins; each regex captures the declared name in group 1.
 */
const DECL_PATTERNS = [
  [/^(?:export\s+)?(?:default\s+)?(?:declare\s+)?(?:async\s+)?function\s*\*?\s*(\w+)/, 'Function'],
  [/^(?:export\s+)?(?:default\s+)?(?:abstract\s+|declare\s+)*class\s+(\w+)/, 'Class'],
  [/^(?:export\s+)?(?:declare\s+)?interface\s+(\w+)/, 'Interface'],
  [/^(?:export\s+)?(?:declare\s+)?type\s+(\w+)/, 'TypeAlias'],
  [/^(?:export\s+)?(?:declare\s+)?(?:const|let|var)\s+(\w+)/, 'Variable'],
  [/^(?:export\s+)?(?:const\s+)?enum\s+(\w+)/, 'Enum'],
  [/^(?:export\s+)?(?:declare\s+)?(?:namespace|module)\s+(\w+)/, 'Namespace'],
  // Property / method inside a class, interface, or type-alias body.
  // Handles: name:, name?:, name(, name<, quoted keys like "colors/columns"
  [/^(?:(?:public|private|protected|readonly|static|abstract|override|declare)\s+)*(['"]?[\w\/ -]+['"]?)\s*(?:\??\s*[:(<]|\s*\?\s*[;,)\s])/, 'Property'],
];

/**
 * Patterns that identify a line which opens a named container body
 * (class, interface, or object-literal type alias).
 * Captured group 1 is the container name.
 */
const CONTAINER_PATTERNS = [
  /^(?:export\s+)?(?:default\s+)?(?:abstract\s+|declare\s+)*class\s+(\w+)/,
  /^(?:export\s+)?(?:declare\s+)?interface\s+(\w+)/,
  // type X = { ... }  — matches plain and intersection forms: type X = Y & {
  /^(?:export\s+)?(?:declare\s+)?type\s+(\w+)\s*(?:<[^>]*>)?\s*=.*\{/,
];

// ── Tag detection ─────────────────────────────────────────────────────────────

/**
 * Returns true if `text` contains `tag` as a whole token (not as a substring
 * of a longer tag name).  The lookahead accepts whitespace, end-of-string, or
 * a comment-closing character (`*` or `/`) so it works on both source lines
 * and raw comment text.
 *
 * Examples:
 *   hasTag(' * @internal', '@internal')    → true
 *   hasTag(' * @internalFoo', '@internal') → false  (was a false positive before)
 *   hasTag('/** @beta *\/', '@beta')        → true
 *
 * @param {string} text
 * @param {string} tag   e.g. "@internal"
 * @returns {boolean}
 */
function hasTag(text, tag) {
  // Escape any regex metacharacters in the tag name (@ is not special, but be safe).
  const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('(^|\\s)' + escaped + '(?=\\s|$|[*/])', 'i').test(text);
}

// ── Kind extraction ───────────────────────────────────────────────────────────

/**
 * Try to match a trimmed source line against DECL_PATTERNS.
 * Returns { name, kind } on success, or null if the line is not a declaration.
 *
 * @param {string} trimmed
 * @returns {{ name: string, kind: string } | null}
 */
function extractDeclaration(trimmed) {
  if (
    !trimmed ||
    trimmed.startsWith('//') ||
    trimmed.startsWith('*') ||
    trimmed.startsWith('@') ||
    trimmed === '{' ||
    trimmed === '}'
  ) {
    return null;
  }
  for (const [re, kind] of DECL_PATTERNS) {
    const m = trimmed.match(/** @type {RegExp} */ (re));
    if (m) {
      const name = (m[1] || '').replace(/['"]/g, '');
      if (name) return { name, kind };
    }
  }
  return null;
}

/**
 * Refine the raw kind label using name, source-line, and file-path heuristics.
 *
 * Variable promotions (checked via the RHS of the assignment):
 *   const foo = (x) => ...           → Function  (plain arrow)
 *   const foo = async (x) => ...     → Function  (async arrow)
 *   const foo = <T>(x: T) => ...     → Function  (generic arrow)
 *   const foo: Type = (x) => ...     → Function  (typed const arrow)
 *   const foo = function(...) { }    → Function  (function expression)
 *   const Foo = defineComponent(…)   → Component (Vue defineComponent)
 *
 * Name-based promotions (applied after the above):
 *   use[A-Z]… (Function or Variable) → Hook
 *   with[A-Z]… (Function or Variable) → Decorator
 *   [A-Z]… in a .tsx file             → Component
 *
 * @param {string} name
 * @param {string} kind         Raw kind from DECL_PATTERNS.
 * @param {string} filePath     Absolute path of the source file.
 * @param {string} [sourceLine] Trimmed source line (enables arrow-fn detection).
 * @returns {string}
 */
function refineKind(name, kind, filePath, sourceLine) {
  if (kind === 'Variable' && sourceLine) {
    const afterName = sourceLine.slice(sourceLine.indexOf(name) + name.length);
    // Strip an optional `: TypeAnnotation` before the `=` so typed consts work.
    const rhs = afterName.replace(/^\s*:[^=]*(?==)/, '');
    if (
      /^\s*=\s*(async\s*)?(<[^>]*>\s*)?\(/.test(rhs) ||
      /^\s*=\s*function[\s(]/.test(rhs)
    ) {
      kind = 'Function';
    } else if (/^\s*=\s*defineComponent\s*\(/.test(rhs)) {
      kind = 'Component';
    }
  }

  if (kind === 'Function' || kind === 'Variable') {
    if (/^use[A-Z]/.test(name))  return 'Hook';
    if (/^with[A-Z]/.test(name)) return 'Decorator';
    if (/^[A-Z]/.test(name) && filePath.endsWith('.tsx')) return 'Component';
  }
  return kind;
}

/**
 * If the trimmed line opens a named container body, return the container name;
 * otherwise return null.
 *
 * @param {string} trimmed
 * @returns {string | null}
 */
function extractContainerName(trimmed) {
  for (const re of CONTAINER_PATTERNS) {
    const m = trimmed.match(re);
    if (m && m[1]) return m[1];
  }
  return null;
}

// ── Brace / container tracking ────────────────────────────────────────────────

/**
 * Walk the characters of a source line, counting '{' and '}' (ignoring those
 * inside string literals and single-line comments), and keeping the container
 * stack in sync.
 *
 * @param {string} line
 * @param {number} currentDepth
 * @param {Array<{name: string, depth: number}>} stack  Mutated in place.
 * @param {string | null} [openingContainerName]
 *   When provided, push this name onto the stack when the first '{' is seen.
 *   The returned `openingContainerName` is `null` once the name has been
 *   consumed (i.e. pushed), or still set if no '{' was encountered — allowing
 *   callers to persist it until the matching '{' appears on a later line.
 * @returns {{ braceDepth: number, openingContainerName: string | null }}
 */
function updateBraceDepth(line, currentDepth, stack, openingContainerName = null) {
  let depth = currentDepth;
  let inStr = false;
  let strChar = '';
  let firstOpenOnLine = true;

  for (let ci = 0; ci < line.length; ci++) {
    const ch = line[ci];

    // Simplistic string tracking (no template literals, no escaped chars)
    if (!inStr && (ch === '"' || ch === "'" || ch === '`')) {
      inStr = true; strChar = ch; continue;
    }
    if (inStr && ch === strChar && line[ci - 1] !== '\\') {
      inStr = false; continue;
    }
    if (inStr) continue;

    if (ch === '/' && line[ci + 1] === '/') break; // single-line comment

    if (ch === '{') {
      depth++;
      if (firstOpenOnLine && openingContainerName) {
        stack.push({ name: openingContainerName, depth });
        openingContainerName = null; // consumed — clear so callers know
      }
      firstOpenOnLine = false;
    } else if (ch === '}') {
      while (stack.length > 0 && stack[stack.length - 1].depth >= depth) {
        stack.pop();
      }
      depth--;
    }
  }

  return { braceDepth: depth, openingContainerName };
}

/**
 * Qualify a property name with its enclosing container, e.g.
 * "MyInterface.myProp".  Non-property declarations are returned as-is.
 *
 * @param {{ name: string, kind: string }} decl
 * @param {Array<{name: string, depth: number}>} containerStack
 * @returns {string}
 */
function qualifyName(decl, containerStack) {
  if (decl.kind === 'Property' && containerStack.length > 0) {
    return `${containerStack[containerStack.length - 1].name}.${decl.name}`;
  }
  return decl.name;
}

// ── Source scanning ───────────────────────────────────────────────────────────

/**
 * @typedef {{ tag: string, name: string, kind: string, file: string, line: number }} TaggedDecl
 */

/**
 * Scan all non-test .ts/.tsx source files under absDirs and return every
 * declaration preceded by one of the configured modifier tags in a JSDoc block.
 *
 * Results are deduplicated by (tag, name, file, line).
 *
 * @param {string[]} absDirs  Absolute paths to scan.
 * @returns {TaggedDecl[]}
 */
function scanSourceFiles(absDirs) {
  /** @type {Set<string>} */
  const seen = new Set();
  /** @type {TaggedDecl[]} */
  const results = [];

  for (const dir of absDirs) {
    if (!fs.existsSync(dir)) continue;

    let files = [];
    try {
      const raw = execSync(
        `find "${dir}" -type f \\( -name "*.ts" -o -name "*.tsx" \\)` +
          ` ! -name "*.d.ts"` +
          ` ! -path "*/__mocks__/*"` +
          ` ! -path "*/__tests__/*"` +
          ` ! -path "*/node_modules/*"` +
          ` ! -name "*.test.ts"` +
          ` ! -name "*.test.tsx"` +
          ` ! -name "*.spec.ts"` +
          ` ! -name "*.spec.tsx"`,
        { encoding: 'utf-8', timeout: 15000, cwd: REPO_ROOT },
      );
      files = raw.trim().split('\n').filter(Boolean);
    } catch (err) {
      console.warn(
        `[tag-report] Failed to list files in "${dir}" (cwd: "${REPO_ROOT}"): ` +
          (err instanceof Error ? err.message : String(err)),
      );
      continue;
    }

    for (const filePath of files) {
      scanFile(filePath, seen, results);
    }
  }

  return results;
}

/**
 * Scan a single file for tagged declarations and append matches to results.
 * Extracted from scanSourceFiles for clarity.
 *
 * @param {string} filePath
 * @param {Set<string>} seen        Deduplication set, mutated.
 * @param {TaggedDecl[]} results    Output array, mutated.
 */
function scanFile(filePath, seen, results) {
  let content;
  try { content = fs.readFileSync(filePath, 'utf-8'); } catch { return; }

  const lines = content.split('\n');
  /** @type {Set<string>} Tags collected from the currently-open JSDoc block */
  let pendingTags = new Set();
  let inBlock = false;
  let braceDepth = 0;
  /** @type {Array<{name: string, depth: number}>} */
  const containerStack = [];
  /**
   * Container name waiting for its opening '{', which may be on the next line.
   * Cleared to null once the name has been pushed onto containerStack.
   * @type {string | null}
   */
  let pendingContainerName = null;
  /**
   * Net unclosed parentheses inside a multi-line decorator body, e.g. @Component({…}).
   * While > 0, pendingTags processing is suppressed so decorator keys like
   * 'selector:' or 'providers:' are not mistaken for tagged declarations.
   */
  let decoratorParenDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();

    // ── Single-line block comment: /** @tag */ declaration (JSDoc only, not plain /*)
    if (t.startsWith('/**') && t.includes('*/')) {
      const tagsHere = TAGS_TO_REPORT.filter((tag) => hasTag(t, tag));
      if (tagsHere.length) {
        const afterClose = t.slice(t.lastIndexOf('*/') + 2).trim();
        if (afterClose) {
          const decl = extractDeclaration(afterClose);
          if (decl) {
            emit(decl, afterClose, tagsHere, filePath, i + 1, containerStack, seen, results);
            ({ braceDepth, openingContainerName: pendingContainerName } = updateBraceDepth(
              afterClose, braceDepth, containerStack,
              extractContainerName(afterClose) ?? pendingContainerName,
            ));
            continue;
          }
        }
        pendingTags = new Set(tagsHere);
      }
      inBlock = false;
      ({ braceDepth } = updateBraceDepth(t, braceDepth, containerStack));
      continue;
    }

    // ── Opening of a multi-line JSDoc block comment (/** only, not plain /*)
    if (t.startsWith('/**')) {
      inBlock = true;
      pendingTags = new Set();
      // Tags can appear on the opening line itself, e.g. `/** @internal some text`
      for (const tag of TAGS_TO_REPORT) {
        if (hasTag(t, tag)) pendingTags.add(tag);
      }
      continue;
    }

    // ── Inside a block comment: collect tags
    if (inBlock) {
      for (const tag of TAGS_TO_REPORT) {
        if (hasTag(t, tag)) pendingTags.add(tag);
      }
      if (t.endsWith('*/')) inBlock = false;
      continue;
    }

    // ── Regular source line
    const containerName = extractContainerName(t);

    // ── Decorator paren tracking ──────────────────────────────────────────────
    // Suppress pendingTags processing while inside a multi-line decorator body
    // so that keys like `selector:` or `providers:` are not mistaken for
    // tagged declarations.
    if (t.startsWith('@') && !TAGS_TO_REPORT.some((tag) => hasTag(t, tag))) {
      // Decorator line — accumulate net unclosed parens.
      const opens  = (t.match(/\(/g) || []).length;
      const closes = (t.match(/\)/g) || []).length;
      decoratorParenDepth = Math.max(0, decoratorParenDepth + opens - closes);
    } else if (decoratorParenDepth > 0) {
      // Inside a multi-line decorator body — track until all parens are closed.
      const opens  = (t.match(/\(/g) || []).length;
      const closes = (t.match(/\)/g) || []).length;
      decoratorParenDepth = Math.max(0, decoratorParenDepth + opens - closes);
    }

    if (pendingTags.size > 0 && t && !t.startsWith('//') && decoratorParenDepth === 0) {
      const decl = extractDeclaration(t);
      if (decl) {
        emit(decl, t, [...pendingTags], filePath, i + 1, containerStack, seen, results);
        pendingTags = new Set();
      } else if (!t.startsWith('@') && t !== '' && t !== '{' && t !== '}') {
        // Unrecognised non-trivial line — clear pending to avoid false matches.
        pendingTags = new Set();
      }
    }

    ({ braceDepth, openingContainerName: pendingContainerName } = updateBraceDepth(
      t, braceDepth, containerStack,
      containerName ?? pendingContainerName,
    ));
  }
}

/**
 * Build a TaggedDecl and append it to results (if not already seen).
 *
 * @param {{ name: string, kind: string }} decl
 * @param {string} sourceLine        Trimmed source line (for refineKind).
 * @param {string[]} tags
 * @param {string} filePath
 * @param {number} lineNumber        1-based.
 * @param {Array<{name: string, depth: number}>} containerStack
 * @param {Set<string>} seen
 * @param {TaggedDecl[]} results
 */
function emit(decl, sourceLine, tags, filePath, lineNumber, containerStack, seen, results) {
  const name = qualifyName(decl, containerStack);
  const kind = refineKind(decl.name, decl.kind, filePath, sourceLine);
  for (const tag of tags) {
    const key = `${tag}::${name}::${filePath}::${lineNumber}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push({ tag, name, kind, file: filePath, line: lineNumber });
    }
  }
}

module.exports = { scanSourceFiles };

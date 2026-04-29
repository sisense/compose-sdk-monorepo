/**
 * A set of pure utils to be consumed accross the plugin.
 *
 * @module
 */

export function escapeChars(str: string, useHTMLEncodedBrackets = false) {
  return str
    .replace(/>/g, useHTMLEncodedBrackets ? '&gt;' : '\\>')
    .replace(/</g, useHTMLEncodedBrackets ? '&lt;' : '\\<')
    .replace(/{/g, '\\{')
    .replace(/_/g, '\\_')
    .replace(/`/g, '\\`')
    .replace(/\|/g, '\\|');
}

/**
 * Encodes angle brackets as HTML entities for MDX-safe output.
 */
export function encodeAngleBrackets(str: string) {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Encodes angle brackets as HTML entities only outside fenced code blocks (```...```).
 * Content inside triple-backtick blocks is left unchanged so code examples keep literal < and >.
 */
export function encodeAngleBracketsOutsideCodeBlocks(str: string): string {
  const codeBlocks: string[] = [];
  const placeholderPrefix = '\u0002CODE_';
  const placeholderSuffix = '_\u0002';
  const fencedRe = /```[\w]*\n[\s\S]*?```/g;
  let withPlaceholders = str.replace(fencedRe, (block) => {
    const index = codeBlocks.length;
    codeBlocks.push(block);
    return `${placeholderPrefix}${index}${placeholderSuffix}`;
  });
  withPlaceholders = encodeAngleBrackets(withPlaceholders);
  codeBlocks.forEach((block, i) => {
    withPlaceholders = withPlaceholders.replace(
      `${placeholderPrefix}${i}${placeholderSuffix}`,
      () => block,
    );
  });
  return withPlaceholders;
}

/**
 * Escapes non html tag angle brackets inside comment blocks.
 * Ignores strings inside code blocks
 */
export function escapeAngleBrackets(str: string) {
  const re = /<(?=(?:[^`]*`[^`]*`)*[^`]*$)[^<]+?>/gi;
  return str.replace(re, (tags) => {
    // CSDK add iframe to the list of supported tags
    const htmlRe = /<(?!\/?(div|span|p|a|br|img|ul|li|strike|em|strong|b|iframe)(>|\s))[^<]+?>/g;
    const shouldEscape = tags.match(htmlRe);
    return shouldEscape ? tags.replace(/>/g, '>` ').replace(/</g, '`<') : tags;
  });
}

/** Convert CSS style string to React style object literal string (camelCase keys). */
function cssStringToJsxStyle(css: string): string {
  const entries = css
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((part) => {
      const colon = part.indexOf(':');
      if (colon === -1) return null;
      const key = part.slice(0, colon).trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      const value = part.slice(colon + 1).trim();
      return { key, value };
    })
    .filter((e): e is { key: string; value: string } => e !== null);
  if (entries.length === 0) return '{}';
  const inner = entries.map((e) => `${e.key}: '${e.value.replace(/'/g, "\\'")}'`).join(', ');
  return `{ ${inner} }`;
}

/** Parse HTML attribute name="value" or name='value' from a tag string. */
function parseHtmlAttributes(tagContent: string): Map<string, string> {
  const attrs = new Map<string, string>();
  // Allow first attribute at start of string (no leading space); rest need leading whitespace
  const attrRe = /(?:^|\s+)(\w+)=["']([^"']*)["']/g;
  let m: RegExpExecArray | null;
  while ((m = attrRe.exec(tagContent)) !== null) {
    attrs.set(m[1].toLowerCase(), m[2]);
  }
  return attrs;
}

/**
 * Convert HTML tags in comment content to valid JSX so they render in MDX (e.g. iframe with
 * style='...' becomes style={{ ... }}, width/height as numbers). Used when convertHtmlToJsxInComments is true.
 * When imgMarkdownSyntax is true, img tags with media:// src are emitted as Markdown image syntax instead of JSX.
 * Returns the string with iframes and img tags replaced by placeholders (or Markdown) and the JSX blocks to substitute back after encoding.
 */
export function convertHtmlToJsxInCommentContent(
  str: string,
  opts?: { imgMarkdownSyntax?: boolean },
): { text: string; jsxBlocks: string[] } {
  const imgMarkdownSyntax = opts?.imgMarkdownSyntax ?? false;
  const jsxBlocks: string[] = [];
  const placeholderPrefix = '\u0001JSX_';
  const placeholderSuffix = '_\u0001';
  let index = 0;
  const numericKeys = ['width', 'height'];
  const styleKey = 'style';

  // Protect fenced code blocks (```...```) so img/iframe replacement never runs inside them.
  const fencedBlocks: string[] = [];
  const fencedPlaceholderPrefix = '\u0003FENCED_';
  const fencedPlaceholderSuffix = '_\u0003';
  const fencedRe = /```[\w]*\n[\s\S]*?```/g;

  /** When imgMarkdownSyntax is true, replace <img ... /> (or <img>...</img>) immediately before closing \n``` with Markdown image so we never corrupt e.g. symbol: '$', in the block. */
  function replaceImgInsideFencedBlock(block: string): string {
    if (!imgMarkdownSyntax) return block;
    const beforeClosingFenceRe = /(\n\s*)<img\s+([\s\S]*?)\s*\/>\s*(\n```)/gi;
    const beforeClosingFenceRe2 = /(\n\s*)<img\s+([\s\S]*?)>[\s\S]*?<\/img>\s*(\n```)/gi;
    let out = block.replace(beforeClosingFenceRe, (_, before: string, attrsStr: string, after: string) => {
      const attrs = parseHtmlAttributes(attrsStr);
      const src = attrs.get('src') ?? '';
      if (!src.startsWith('media://')) return _;
      const pathAfterMedia = src.slice(7).replace(/^\//, '');
      const alt = attrs.get('alt') ?? 'Example';
      return `${before}![${alt}](__MEDIA_PREFIX__${pathAfterMedia})${after}`;
    });
    out = out.replace(beforeClosingFenceRe2, (_, before: string, attrsStr: string, after: string) => {
      const attrs = parseHtmlAttributes(attrsStr);
      const src = attrs.get('src') ?? '';
      if (!src.startsWith('media://')) return _;
      const pathAfterMedia = src.slice(7).replace(/^\//, '');
      const alt = attrs.get('alt') ?? 'Example';
      return `${before}![${alt}](__MEDIA_PREFIX__${pathAfterMedia})${after}`;
    });
    return out;
  }

  // Use workStr so img replacement can match after placeholder; run img replace on str so we can match ``` before <img> when extraction didn't run
  const workStr = str.replace(fencedRe, (block) => {
    const i = fencedBlocks.length;
    fencedBlocks.push(imgMarkdownSyntax ? replaceImgInsideFencedBlock(block) : block);
    return `${fencedPlaceholderPrefix}${i}${fencedPlaceholderSuffix}`;
  });
  // Run img replacement on workStr so we match either closing ``` or placeholder before <img>

  function buildJsxAttrs(attrs: Map<string, string>): string[] {
    const jsxAttrs: string[] = [];
    for (const [name, value] of attrs) {
      if (name === styleKey) {
        jsxAttrs.push(`style={${cssStringToJsxStyle(value)}}`);
      } else if (numericKeys.includes(name) && /^\d+$/.test(value)) {
        jsxAttrs.push(`${name}={${value}}`);
      } else {
        const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        jsxAttrs.push(`${name}="${escaped}"`);
      }
    }
    return jsxAttrs;
  }

  /** For img tags: use require() for media:// src so Docusaurus/Webpack bundle the image. */
  function buildImgJsxAttrs(attrs: Map<string, string>): string[] {
    const jsxAttrs: string[] = [];
    for (const [name, value] of attrs) {
      if (name === 'src' && value.startsWith('media://')) {
        const pathAfterMedia = value.slice(7).replace(/^\//, '');
        jsxAttrs.push(`src={require('__MEDIA_PREFIX__${pathAfterMedia}').default}`);
      } else if (name === styleKey) {
        jsxAttrs.push(`style={${cssStringToJsxStyle(value)}}`);
      } else if (numericKeys.includes(name) && /^\d+$/.test(value)) {
        jsxAttrs.push(`${name}={${value}}`);
      } else {
        const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        jsxAttrs.push(`${name}="${escaped}"`);
      }
    }
    return jsxAttrs;
  }

  // Replace <img only when it appears immediately after a fenced-block placeholder (e.g. FENCED_0_)
  // or after a closing ``` (fallback). Use function replacers so any literal $ in output is never interpreted.
  const imgAfterPlaceholderRe = new RegExp(
    `(${fencedPlaceholderPrefix}\\d+${fencedPlaceholderSuffix})\\s*\\n\\s*<img\\s+([\\s\\S]*?)\\s*\\/>\\s*(?=\\n|$)`,
    'gi',
  );
  const imgAfterPlaceholderRe2 = new RegExp(
    `(${fencedPlaceholderPrefix}\\d+${fencedPlaceholderSuffix})\\s*\\n\\s*<img\\s+([\\s\\S]*?)>[\\s\\S]*?<\\/img>\\s*(?=\\n|$)`,
    'gi',
  );
  const imgAfterClosingFenceRe = new RegExp(
    `(\`\`\`\\s*\\n\\s*)<img\\s+([\\s\\S]*?)\\s*\\/>\\s*(?=\\n|$)`,
    'gi',
  );
  const imgAfterClosingFenceRe2 = new RegExp(
    `(\`\`\`\\s*\\n\\s*)<img\\s+([\\s\\S]*?)>[\\s\\S]*?<\\/img>\\s*(?=\\n|$)`,
    'gi',
  );
  function replaceImgAfterPlaceholder(s: string): string {
    return s
      .replace(imgAfterPlaceholderRe, (_, ph: string, attrsStr: string) => {
        const attrs = parseHtmlAttributes(attrsStr);
        const src = attrs.get('src') ?? '';
        if (imgMarkdownSyntax && src.startsWith('media://')) {
          const pathAfterMedia = src.slice(7).replace(/^\//, '');
          const alt = attrs.get('alt') ?? 'Example';
          return `${ph}\n\n![${alt}](__MEDIA_PREFIX__${pathAfterMedia})`;
        }
        const jsx = `<img ${buildImgJsxAttrs(attrs).join(' ')} />`;
        jsxBlocks.push(jsx);
        const placeholder = `${placeholderPrefix}${index}${placeholderSuffix}`;
        index += 1;
        return `${ph}\n\n${placeholder}`;
      })
      .replace(imgAfterPlaceholderRe2, (_, ph: string, attrsStr: string) => {
        const attrs = parseHtmlAttributes(attrsStr);
        const src = attrs.get('src') ?? '';
        if (imgMarkdownSyntax && src.startsWith('media://')) {
          const pathAfterMedia = src.slice(7).replace(/^\//, '');
          const alt = attrs.get('alt') ?? 'Example';
          return `${ph}\n\n![${alt}](__MEDIA_PREFIX__${pathAfterMedia})`;
        }
        const jsx = `<img ${buildImgJsxAttrs(attrs).join(' ')} />`;
        jsxBlocks.push(jsx);
        const placeholder = `${placeholderPrefix}${index}${placeholderSuffix}`;
        index += 1;
        return `${ph}\n\n${placeholder}`;
      })
      .replace(imgAfterClosingFenceRe, (_, afterFence: string, attrsStr: string) => {
        const attrs = parseHtmlAttributes(attrsStr);
        const src = attrs.get('src') ?? '';
        if (imgMarkdownSyntax && src.startsWith('media://')) {
          const pathAfterMedia = src.slice(7).replace(/^\//, '');
          const alt = attrs.get('alt') ?? 'Example';
          return `${afterFence}![${alt}](__MEDIA_PREFIX__${pathAfterMedia})`;
        }
        const jsx = `<img ${buildImgJsxAttrs(attrs).join(' ')} />`;
        jsxBlocks.push(jsx);
        const placeholder = `${placeholderPrefix}${index}${placeholderSuffix}`;
        index += 1;
        return `${afterFence}${placeholder}`;
      })
      .replace(imgAfterClosingFenceRe2, (_, afterFence: string, attrsStr: string) => {
        const attrs = parseHtmlAttributes(attrsStr);
        const src = attrs.get('src') ?? '';
        if (imgMarkdownSyntax && src.startsWith('media://')) {
          const pathAfterMedia = src.slice(7).replace(/^\//, '');
          const alt = attrs.get('alt') ?? 'Example';
          return `${afterFence}![${alt}](__MEDIA_PREFIX__${pathAfterMedia})`;
        }
        const jsx = `<img ${buildImgJsxAttrs(attrs).join(' ')} />`;
        jsxBlocks.push(jsx);
        const placeholder = `${placeholderPrefix}${index}${placeholderSuffix}`;
        index += 1;
        return `${afterFence}${placeholder}`;
      });
  }

  const workStrAfterImg = (() => {
    let s = replaceImgAfterPlaceholder(workStr);
    // If any <img> remains (e.g. not after placeholder), replace only the LAST one so content before it
    // (including $ or any character) is preserved. Use function replacers so $ in replacement is never interpreted.
    const lastImgOnlyRe = /([\s\S]*)(<img\s+[\s\S]*?)\s*\/>\s*(?=\n|$)/i;
    const lastImgOnlyRe2 = /([\s\S]*)(<img\s+[\s\S]*?)>[\s\S]*?<\/img>\s*(?=\n|$)/i;
    if (/<img\s+/i.test(s)) {
      s = s
        .replace(lastImgOnlyRe, (_, before: string, imgTag: string) => {
          const attrsStr = imgTag.replace(/^<img\s+/, '').replace(/\/?\s*$/, '');
          const attrs = parseHtmlAttributes(attrsStr);
          const src = attrs.get('src') ?? '';
          if (imgMarkdownSyntax && src.startsWith('media://')) {
            const pathAfterMedia = src.slice(7).replace(/^\//, '');
            const alt = attrs.get('alt') ?? 'Example';
            return before + `![${alt}](__MEDIA_PREFIX__${pathAfterMedia})`;
          }
          const jsx = `<img ${buildImgJsxAttrs(attrs).join(' ')} />`;
          jsxBlocks.push(jsx);
          const placeholder = `${placeholderPrefix}${index}${placeholderSuffix}`;
          index += 1;
          return before + placeholder;
        })
        .replace(lastImgOnlyRe2, (_, before: string, imgTag: string) => {
          const attrsStr = imgTag.replace(/^<img\s+/, '').replace(/>[\s\S]*$/, '');
          const attrs = parseHtmlAttributes(attrsStr);
          const src = attrs.get('src') ?? '';
          if (imgMarkdownSyntax && src.startsWith('media://')) {
            const pathAfterMedia = src.slice(7).replace(/^\//, '');
            const alt = attrs.get('alt') ?? 'Example';
            return before + `![${alt}](__MEDIA_PREFIX__${pathAfterMedia})`;
          }
          const jsx = `<img ${buildImgJsxAttrs(attrs).join(' ')} />`;
          jsxBlocks.push(jsx);
          const placeholder = `${placeholderPrefix}${index}${placeholderSuffix}`;
          index += 1;
          return before + placeholder;
        });
    }
    return s;
  })();

  const parts = workStrAfterImg.split('`');
  const result = parts.map((part, i) => {
    if (i % 2 !== 0) return part; // inside backticks, leave unchanged
    let out = part.replace(/<iframe\s+([\s\S]*?)\s*\/>/gi, (_, attrsStr: string) => {
      const attrs = parseHtmlAttributes(attrsStr);
      const jsx = `<iframe ${buildJsxAttrs(attrs).join(' ')} />`;
      jsxBlocks.push(jsx);
      const placeholder = `${placeholderPrefix}${index}${placeholderSuffix}`;
      index += 1;
      return placeholder;
    });
    return out;
  });
  let text = result.join('`');
  fencedBlocks.forEach((block, i) => {
    const placeholder = `${fencedPlaceholderPrefix}${i}${fencedPlaceholderSuffix}`;
    text = text.replace(placeholder, () => block);
  });
  return { text, jsxBlocks };
}

export function unEscapeChars(str: string) {
  return str
    .replace(/\\</g, '<')
    .replace(/\\>/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\\_/g, '_')
    .replace(/\\{/g, '{')
    .replace(/`/g, '')
    .replace(/\*/g, '')
    .replace(/\\\|/g, '|')
    .replace(/\[([^\[\]]*)\]\((.*?)\)/gm, '$1');
}

export function stripComments(str: string) {
  return str
    .replace(/(?:\/\*(?:[\s\S]*?)\*\/)|(?:^\s*\/\/(?:.*)$)/g, ' ')
    .replace(/\n/g, '')
    .replace(/^\s+|\s+$|(\s)+/g, '$1');
}

export function tableComments(str: string) {
  return str.replace(/\|/g, '\\|');
}

export function stripLineBreaks(str: string, includeHTML = true) {
  return str
    .replace(/\n(?=(?:[^`]*`[^`]*`)*[^`]*$)/gi, includeHTML ? '<br />' : ' ')
    .replace(/\`\`\`ts/g, '`')
    .replace(/\`\`\`/g, '`')
    .replace(/\n/g, ' ');
}

export function camelToTitleCase(text: string) {
  return (
    text.substring(0, 1).toUpperCase() +
    text.substring(1).replace(/[a-z][A-Z]/g, (x) => `${x[0]} ${x[1]}`)
  );
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatContents(contents: string) {
  return contents.replace(/[\r\n]{3,}/g, '\n\n').replace(/^\s+|\s+$/g, '') + '\n';
}

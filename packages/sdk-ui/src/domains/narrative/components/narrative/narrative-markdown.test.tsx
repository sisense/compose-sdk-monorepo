import { renderToStaticMarkup } from 'react-dom/server';

import Markdown from 'markdown-to-jsx';
import { describe, expect, it } from 'vitest';

import { NARRATIVE_MARKDOWN_OPTIONS } from './narrative-markdown.js';

const render = (text: string) =>
  renderToStaticMarkup(<Markdown options={NARRATIVE_MARKDOWN_OPTIONS}>{text}</Markdown>);

describe('NARRATIVE_MARKDOWN_OPTIONS', () => {
  it('renders emphasis', () => {
    expect(render('Revenue **rose 15%**, *slightly*.')).toBe(
      '<span>Revenue <strong>rose 15%</strong>, <em>slightly</em>.</span>',
    );
  });

  it('collapses strikethrough and inline code to their text', () => {
    expect(render('~~gone~~ and `code`')).toBe('<span>gone and code</span>');
  });

  it('renders a link as its label and an image as nothing', () => {
    expect(render('see [details](https://example.com) ![chart](https://example.com/c.png)')).toBe(
      '<span>see details</span>',
    );
  });

  it('keeps raw HTML and block syntax inert', () => {
    expect(render('<b>x</b> # not a heading')).toBe(
      '<span>&lt;b&gt;x&lt;/b&gt; # not a heading</span>',
    );
  });
});

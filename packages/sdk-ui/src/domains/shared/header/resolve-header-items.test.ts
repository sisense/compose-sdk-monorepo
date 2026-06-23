import { describe, expect, it, vi } from 'vitest';

import { resolveHeaderItems } from './resolve-header-items.js';
import { HeaderItem, ResolvedHeaderItem } from './types.js';

const noop = () => null;

const item = (id: string, overrides: Partial<HeaderItem> = {}): HeaderItem => ({
  id,
  component: noop,
  ...overrides,
});

const ids = (items: { id: string }[]) => items.map((i) => i.id);

describe('resolveHeaderItems', () => {
  // Built-ins model the dashboard skeleton: title, center spacer, then trailing actions.
  const builtIns: HeaderItem[] = [item('title'), item('spacer'), item('menu')];
  const withSpacer = { autoAnchorId: 'spacer' } as const;

  it('keeps built-in order when there is no config', () => {
    expect(ids(resolveHeaderItems(builtIns))).toEqual(['title', 'spacer', 'menu']);
  });

  it('strips position from resolved items', () => {
    const resolved = resolveHeaderItems(builtIns, {
      items: [item('custom', { position: { type: 'first' } })],
    });
    expect(resolved.every((i) => !('position' in i))).toBe(true);
  });

  it('places auto items immediately after the auto anchor (spacer)', () => {
    const resolved = resolveHeaderItems(
      builtIns,
      { items: [item('custom', { position: { type: 'auto' } })] },
      withSpacer,
    );
    expect(ids(resolved)).toEqual(['title', 'spacer', 'custom', 'menu']);
  });

  it('defaults new items to auto positioning', () => {
    const resolved = resolveHeaderItems(builtIns, { items: [item('custom')] }, withSpacer);
    expect(ids(resolved)).toEqual(['title', 'spacer', 'custom', 'menu']);
  });

  it('appends auto items at the end when there is no anchor', () => {
    const resolved = resolveHeaderItems(builtIns, { items: [item('custom')] });
    expect(ids(resolved)).toEqual(['title', 'spacer', 'menu', 'custom']);
  });

  it('keeps declaration order for multiple auto items', () => {
    const resolved = resolveHeaderItems(
      builtIns,
      { items: [item('a'), item('b'), item('c')] },
      withSpacer,
    );
    expect(ids(resolved)).toEqual(['title', 'spacer', 'a', 'b', 'c', 'menu']);
  });

  it('supports before/after positions', () => {
    const resolved = resolveHeaderItems(builtIns, {
      items: [
        item('a', { position: { type: 'before', target: 'spacer' } }),
        item('b', { position: { type: 'after', target: 'spacer' } }),
      ],
    });
    expect(ids(resolved)).toEqual(['title', 'a', 'spacer', 'b', 'menu']);
  });

  it('keeps declaration order for multiple items sharing the same before/after anchor', () => {
    const resolved = resolveHeaderItems(builtIns, {
      items: [
        item('a', { position: { type: 'after', target: 'title' } }),
        item('b', { position: { type: 'after', target: 'title' } }),
        item('c', { position: { type: 'before', target: 'menu' } }),
        item('d', { position: { type: 'before', target: 'menu' } }),
      ],
    });
    expect(ids(resolved)).toEqual(['title', 'a', 'b', 'spacer', 'c', 'd', 'menu']);
  });

  it('supports first/last positions in declaration order', () => {
    const resolved = resolveHeaderItems(builtIns, {
      items: [
        item('f1', { position: { type: 'first' } }),
        item('f2', { position: { type: 'first' } }),
        item('l1', { position: { type: 'last' } }),
      ],
    });
    expect(ids(resolved)).toEqual(['f1', 'f2', 'title', 'spacer', 'menu', 'l1']);
  });

  it('places items before (left of) the title', () => {
    const resolved = resolveHeaderItems(builtIns, {
      items: [item('left', { position: { type: 'before', target: 'title' } })],
    });
    expect(ids(resolved)).toEqual(['left', 'title', 'spacer', 'menu']);
  });

  it('resolves before/after targets that are themselves positioned (deferral)', () => {
    const resolved = resolveHeaderItems(builtIns, {
      items: [
        item('b', { position: { type: 'after', target: 'a' } }),
        item('a', { position: { type: 'after', target: 'spacer' } }),
      ],
    });
    expect(ids(resolved)).toEqual(['title', 'spacer', 'a', 'b', 'menu']);
  });

  it('drops an item with an unknown before/after target and logs a console.error', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const resolved = resolveHeaderItems(
        builtIns,
        { items: [item('orphan', { position: { type: 'after', target: 'does-not-exist' } })] },
        withSpacer,
      );
      expect(ids(resolved)).toEqual(['title', 'spacer', 'menu']);
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('does-not-exist'));
    } finally {
      errorSpy.mockRestore();
    }
  });

  it('ignores a user item with a built-in id and logs a console.error', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const resolved = resolveHeaderItems(builtIns, { items: [item('menu')] });
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('menu'));
      expect(ids(resolved)).toEqual(['title', 'spacer', 'menu']); // built-in menu still present
    } finally {
      errorSpy.mockRestore();
    }
  });

  it('throws when two user items share an id', () => {
    expect(() => resolveHeaderItems(builtIns, { items: [item('dup'), item('dup')] })).toThrow(
      /Duplicate header item id/,
    );
  });

  it('applies onBeforeRender to the final ordered list', () => {
    const onBeforeRender = vi.fn((items: ReadonlyArray<ResolvedHeaderItem>) =>
      items.filter((i) => i.id !== 'spacer'),
    );
    const resolved = resolveHeaderItems(builtIns, { onBeforeRender });
    expect(onBeforeRender).toHaveBeenCalledTimes(1);
    expect(ids(resolved)).toEqual(['title', 'menu']);
  });

  it('does not mutate the input built-in items', () => {
    const input = [item('title'), item('menu')];
    const snapshot = ids(input);
    resolveHeaderItems(input, { items: [item('x', { position: { type: 'first' } })] });
    expect(ids(input)).toEqual(snapshot);
  });

  describe('hidden built-in anchors', () => {
    // A hidden 'filter' built-in sits between the spacer and the menu: not rendered, but a valid
    // positioning anchor.
    const withHidden: HeaderItem[] = [
      item('title'),
      item('spacer'),
      item('filter', { hidden: true }),
      item('menu'),
    ];

    it('drops hidden built-ins from the output even without any user config', () => {
      expect(ids(resolveHeaderItems(withHidden, undefined, withSpacer))).toEqual([
        'title',
        'spacer',
        'menu',
      ]);
    });

    it('positions a user item relative to a hidden anchor, then drops the anchor', () => {
      const resolved = resolveHeaderItems(
        withHidden,
        { items: [item('custom', { position: { type: 'before', target: 'filter' } })] },
        withSpacer,
      );
      // 'custom' lands where the hidden 'filter' anchor was (just before the menu); 'filter' itself
      // does not render.
      expect(ids(resolved)).toEqual(['title', 'spacer', 'custom', 'menu']);
    });

    it('keeps a user item anchored after a hidden built-in', () => {
      const resolved = resolveHeaderItems(
        withHidden,
        { items: [item('custom', { position: { type: 'after', target: 'filter' } })] },
        withSpacer,
      );
      expect(ids(resolved)).toEqual(['title', 'spacer', 'custom', 'menu']);
    });

    it('does not expose hidden built-ins to onBeforeRender', () => {
      const onBeforeRender = vi.fn((items: ReadonlyArray<ResolvedHeaderItem>) => [...items]);
      resolveHeaderItems(withHidden, { onBeforeRender }, withSpacer);
      const passed = onBeforeRender.mock.calls[0][0];
      expect(ids([...passed])).toEqual(['title', 'spacer', 'menu']);
    });

    it('reserves a hidden built-in id against user items', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      try {
        const resolved = resolveHeaderItems(withHidden, { items: [item('filter')] }, withSpacer);
        expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('filter'));
        expect(ids(resolved)).toEqual(['title', 'spacer', 'menu']);
      } finally {
        errorSpy.mockRestore();
      }
    });
  });
});

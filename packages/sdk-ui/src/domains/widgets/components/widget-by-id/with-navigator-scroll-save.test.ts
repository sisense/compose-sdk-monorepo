import { describe, expect, it, vi } from 'vitest';

import type { WidgetProps } from '../widget/types';
import { withNavigatorScrollSave } from './with-navigator-scroll-save';

describe('withNavigatorScrollSave', () => {
  it('returns props unchanged when styleOptions is missing', () => {
    const props = { id: 'w1', type: 'chart' } as unknown as WidgetProps;
    const next = withNavigatorScrollSave(vi.fn())(props);
    expect(next).toBe(props);
  });

  it('returns props unchanged when navigator is not configured', () => {
    const props = {
      id: 'w1',
      type: 'chart',
      styleOptions: { legend: { enabled: true } },
    } as unknown as WidgetProps;
    const next = withNavigatorScrollSave(vi.fn())(props);
    expect(next).toEqual(props);
  });

  it('merges onScrollerChange into navigator when navigator exists', () => {
    const onScrollerChange = vi.fn();
    const props = {
      id: 'w1',
      type: 'chart',
      styleOptions: {
        navigator: { enabled: true, height: 40 },
      },
    } as unknown as WidgetProps;

    const next = withNavigatorScrollSave(onScrollerChange)(props);

    expect(next).not.toBe(props);
    expect(next).toMatchObject({
      styleOptions: {
        navigator: {
          enabled: true,
          height: 40,
          onScrollerChange,
        },
      },
    });
  });
});

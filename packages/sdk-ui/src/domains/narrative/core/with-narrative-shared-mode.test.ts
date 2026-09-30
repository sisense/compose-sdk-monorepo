import { describe, expect, it } from 'vitest';

import type { WidgetProps } from '@/domains/widgets/components/widget/types';

import { withNarrativeSharedMode } from './with-narrative-shared-mode.js';

const narrative = (id: string, sharedMode?: boolean): WidgetProps => ({
  widgetType: 'narrative',
  id,
  ...(sharedMode === undefined ? {} : { sharedMode }),
});
const text: WidgetProps = {
  widgetType: 'text',
  id: 't1',
  styleOptions: { html: '<p>x</p>', bgColor: '#fff', vAlign: 'valign-middle' },
};

describe('withNarrativeSharedMode', () => {
  it('marks every narrative widget in shared mode and leaves the others alone', () => {
    const widgets = [narrative('n1'), text, narrative('n2')];

    const result = withNarrativeSharedMode(true)(widgets);

    expect(result).toEqual([narrative('n1', true), text, narrative('n2', true)]);
    expect(result[1]).toBe(text);
  });

  it('keeps a sharedMode the widget already carries', () => {
    expect(withNarrativeSharedMode(true)([narrative('n1', false)])).toEqual([
      narrative('n1', false),
    ]);
  });

  it('returns the input outside shared mode or without a narrative widget', () => {
    const widgets = [narrative('n1'), text];

    expect(withNarrativeSharedMode(false)(widgets)).toBe(widgets);
    expect(withNarrativeSharedMode(true)([text])).toEqual([text]);
  });

  it('does not mutate the input', () => {
    const widget = narrative('n1');

    withNarrativeSharedMode(true)([widget]);

    expect(widget).not.toHaveProperty('sharedMode');
  });
});

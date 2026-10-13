import { describe, expect, it } from 'vitest';

import type { WidgetProps } from '@/domains/widgets/components/widget/types';

import { withNarrativeRequestOptions } from './with-narrative-request-options.js';

const narrative = (
  id: string,
  options: { sharedMode?: boolean; adminAccess?: boolean } = {},
): WidgetProps => ({ widgetType: 'narrative', id, ...options });
const text: WidgetProps = {
  widgetType: 'text',
  id: 't1',
  styleOptions: { html: '<p>x</p>', bgColor: '#fff', vAlign: 'valign-middle' },
};

describe('withNarrativeRequestOptions', () => {
  it('marks every narrative widget in shared mode and leaves the others alone', () => {
    const widgets = [narrative('n1'), text, narrative('n2')];

    const result = withNarrativeRequestOptions({ sharedMode: true })(widgets);

    expect(result).toEqual([
      narrative('n1', { sharedMode: true }),
      text,
      narrative('n2', { sharedMode: true }),
    ]);
    expect(result[1]).toBe(text);
  });

  it('marks every narrative widget opened through Admin Access', () => {
    expect(withNarrativeRequestOptions({ adminAccess: true })([narrative('n1')])).toEqual([
      narrative('n1', { adminAccess: true }),
    ]);
  });

  it('sets both options together', () => {
    expect(
      withNarrativeRequestOptions({ sharedMode: true, adminAccess: true })([narrative('n1')]),
    ).toEqual([narrative('n1', { sharedMode: true, adminAccess: true })]);
  });

  it('keeps a value the widget already carries', () => {
    const widget = narrative('n1', { sharedMode: false });

    expect(withNarrativeRequestOptions({ sharedMode: true, adminAccess: true })([widget])).toEqual([
      narrative('n1', { sharedMode: false, adminAccess: true }),
    ]);
    expect(withNarrativeRequestOptions({ sharedMode: true })([widget])[0]).toBe(widget);
  });

  it('returns the input when no option is true or without a narrative widget', () => {
    const widgets = [narrative('n1'), text];

    expect(withNarrativeRequestOptions({})(widgets)).toBe(widgets);
    expect(withNarrativeRequestOptions({ sharedMode: false, adminAccess: false })(widgets)).toBe(
      widgets,
    );
    expect(withNarrativeRequestOptions({ sharedMode: true })([text])).toEqual([text]);
  });

  it('does not mutate the input', () => {
    const widget = narrative('n1');

    withNarrativeRequestOptions({ sharedMode: true, adminAccess: true })([widget]);

    expect(widget).not.toHaveProperty('sharedMode');
    expect(widget).not.toHaveProperty('adminAccess');
  });
});

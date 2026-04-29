import { describe, expect, it } from 'vitest';

import { messages, useIntl } from './use-intl';

describe('useIntl', () => {
  it('returns the message string when it is truthy', () => {
    const intl = useIntl();
    expect(intl.formatMessage('X-Axis')).toBe('X-Axis');
    expect(intl.formatMessage('Grid Lines')).toBe('Grid Lines');
  });

  it('returns "unknown message" when message is an empty string', () => {
    const intl = useIntl();
    expect(intl.formatMessage('')).toBe('unknown message');
  });

  it('exports a messages object with the expected keys', () => {
    expect(messages.xAxis).toBe('X-Axis');
    expect(messages.gridLines).toBe('Grid Lines');
    expect(messages.labels).toBe('Labels');
    expect(messages.title).toBe('Title');
  });
});

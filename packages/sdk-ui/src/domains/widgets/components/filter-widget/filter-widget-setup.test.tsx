import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FilterWidgetSetup } from './filter-widget-setup.js';

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({ t: (_key: string, fallback?: string) => fallback ?? _key }),
  };
});

describe('FilterWidgetSetup', () => {
  it('paints the label and glyph in the primary text color, not the disabled-looking secondary', () => {
    render(
      <FilterWidgetSetup
        onSetup={() => {}}
        controlStyleOptions={{ primaryText: '#123456', secondaryText: '#abcdef' }}
      />,
    );

    // The glyph inherits this through `currentColor`.
    expect(screen.getByTestId('filter-widget-setup-button')).toHaveStyle({
      color: 'rgb(18, 52, 86)',
    });
  });

  it('outlines the button in the primary text color at 55%, as in the design', () => {
    render(
      <FilterWidgetSetup
        onSetup={() => {}}
        controlStyleOptions={{ primaryText: '#123456', secondaryText: '#abcdef' }}
      />,
    );

    // `applyOpacity` returns 8-digit hex: 0x8c / 255 ≈ 0.55.
    expect(screen.getByTestId('filter-widget-setup-button').style.borderColor).toBe('#1234568c');
  });
});

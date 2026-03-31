/** @vitest-environment jsdom */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { wcagContrastRatio } from '@/__test-helpers__/wcag-color-contrast';
import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';
import { getDefaultThemeSettings } from '@/infra/contexts/theme-provider/default-theme-settings';
import { ThemeProvider } from '@/infra/contexts/theme-provider/theme-provider';

import * as noResultsImages from './images';
import { NoResultsOverlay } from './no-results-overlay';

vi.mock('@/infra/contexts/sisense-context/sisense-context', async () => {
  const actual = await vi.importActual<
    typeof import('@/infra/contexts/sisense-context/sisense-context')
  >('@/infra/contexts/sisense-context/sisense-context');
  return {
    ...actual,
    useSisenseContext: vi.fn(),
  };
});

vi.mock('react-i18next', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-i18next')>();
  return {
    ...mod,
    useTranslation: () => ({
      t: (key: string) => key,
    }),
  };
});

const useSisenseContextMock = useSisenseContext as ReturnType<typeof vi.fn>;

describe('NoResultsOverlay', () => {
  beforeEach(() => {
    // `withDefaultTranslations` wraps with I18nProvider only when Sisense is not initialized.
    useSisenseContextMock.mockReturnValue({
      app: undefined,
      isInitialized: false,
      tracking: { enabled: false },
      errorBoundary: { showErrorBox: true },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders image with alt text from chart no-data translation (same as visible title)', async () => {
    render(
      <ThemeProvider skipTracking>
        <NoResultsOverlay iconType="table" />
      </ThemeProvider>,
    );

    const img = await screen.findByRole('img', { name: 'chartNoData' });
    expect(img).toHaveAttribute('alt', 'chartNoData');
    expect(img).toHaveAttribute('src', noResultsImages.getNoResultOverlayImage('table'));
  });

  it('does not render img when icon is not available', async () => {
    vi.spyOn(noResultsImages, 'getNoResultOverlayImage').mockReturnValue('');

    const { container } = render(
      <ThemeProvider skipTracking>
        <NoResultsOverlay iconType="bar" />
      </ThemeProvider>,
    );

    await screen.findByText('chartNoData');
    expect(container.querySelector('img')).toBeNull();
  });

  it('applies typography.secondaryTextColor from theme to the title', async () => {
    render(
      <ThemeProvider theme={{ typography: { secondaryTextColor: '#ff00ff' } }} skipTracking>
        <NoResultsOverlay iconType="line" />
      </ThemeProvider>,
    );

    const title = await screen.findByText('chartNoData');
    expect(title).toHaveStyle({ color: 'rgb(255, 0, 255)' });
  });

  it('uses default theme secondary text color when nested in ThemeProvider without typography override', async () => {
    render(
      <ThemeProvider skipTracking>
        <NoResultsOverlay iconType="line" />
      </ThemeProvider>,
    );

    const title = await screen.findByText('chartNoData');
    expect(title).toHaveStyle({ color: 'rgb(112, 116, 125)' });
  });

  describe('NoResultsOverlay contrast (WCAG 2.1 AA)', () => {
    it.each([
      { isDark: false, label: 'light' },
      { isDark: true, label: 'dark' },
    ])(
      'default $label theme: typography.secondaryTextColor vs chart.backgroundColor is at least 4.5:1',
      ({ isDark }) => {
        const settings = getDefaultThemeSettings(isDark);
        const fg = settings.typography.secondaryTextColor;
        const bg = settings.chart.backgroundColor;
        expect(fg).toBeDefined();
        expect(bg).toBeDefined();
        if (
          typeof fg !== 'string' ||
          typeof bg !== 'string' ||
          !/^#[0-9a-fA-F]{6}$/.test(fg) ||
          !/^#[0-9a-fA-F]{6}$/.test(bg)
        ) {
          throw new Error('Test expects #RRGGBB hex for contrast helper');
        }
        expect(wcagContrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5);
      },
    );
  });
});

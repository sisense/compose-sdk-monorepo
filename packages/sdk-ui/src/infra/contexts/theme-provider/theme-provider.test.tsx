import React from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { CompleteThemeSettings } from '../../../types';
import { ThemeSettings } from '../../../types';
import { getThemeSettingsByOid } from '../../themes/theme-loader';
import { useSisenseContext } from '../sisense-context/sisense-context';
import { getDefaultThemeSettings } from './default-theme-settings';
import { useThemeContext } from './theme-context';
import { ThemeProvider } from './theme-provider';

vi.mock('../../themes/theme-loader', () => ({
  getThemeSettingsByOid: vi.fn(),
}));

vi.mock('../sisense-context/sisense-context', async () => {
  const actual: typeof import('../sisense-context/sisense-context') = await vi.importActual(
    '../sisense-context/sisense-context',
  );

  return {
    ...actual,
    useSisenseContext: vi.fn(),
  };
});

const getThemeSettingsByOidMock = getThemeSettingsByOid as Mock;
const useSisenseContextMock = useSisenseContext as Mock;

describe('ThemeProvider', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.restoreAllMocks();
    useSisenseContextMock.mockReturnValue({
      app: { httpClient: {} } as any,
      isInitialized: true,
      tracking: {
        enabled: false,
      },
      errorBoundary: {
        showErrorBox: true,
      },
    });
  });

  it('should render children with default theme settings when no theme is provided', async () => {
    let actuallyRenderedThemeSettings: CompleteThemeSettings | undefined;
    const ChildComponent = () => {
      const { themeSettings } = useThemeContext();
      actuallyRenderedThemeSettings = themeSettings;
      return <div data-testid="child">Child component with default theme</div>;
    };

    render(
      <ThemeProvider skipTracking>
        <ChildComponent />
      </ThemeProvider>,
    );

    const childElement = await screen.findByTestId('child');
    expect(childElement).toBeInTheDocument();
    expect(actuallyRenderedThemeSettings).toEqual(getDefaultThemeSettings());
  });

  it('should render children with provided theme settings', async () => {
    const theme: ThemeSettings = {
      general: {
        brandColor: '#123456',
      },
    };

    let actuallyRenderedThemeSettings: CompleteThemeSettings | undefined;
    const ChildComponent = () => {
      const { themeSettings } = useThemeContext();
      actuallyRenderedThemeSettings = themeSettings;
      return <div data-testid="child">Child component with customized theme</div>;
    };

    render(
      <ThemeProvider theme={theme} skipTracking>
        <ChildComponent />
      </ThemeProvider>,
    );

    const childElement = await screen.findByTestId('child');
    expect(childElement).toBeInTheDocument();
    expect(actuallyRenderedThemeSettings).toEqual({
      ...getDefaultThemeSettings(),
      general: {
        ...getDefaultThemeSettings().general,
        brandColor: '#123456',
      },
    });
  });

  it('should load theme settings by oid', async () => {
    const themeFromServer = {
      ...getDefaultThemeSettings(),
      general: {
        ...getDefaultThemeSettings().general,
        brandColor: '#dd0000',
      },
    };
    getThemeSettingsByOidMock.mockReturnValue(Promise.resolve(themeFromServer));

    let actuallyRenderedThemeSettings: CompleteThemeSettings | undefined;
    const ChildComponent = () => {
      const { themeSettings } = useThemeContext();
      actuallyRenderedThemeSettings = themeSettings;
      return <div data-testid="child">Child component with theme from server</div>;
    };

    render(
      <ThemeProvider theme="12345" skipTracking>
        <ChildComponent />
      </ThemeProvider>,
    );

    const childElement = await screen.findByTestId('child');
    expect(childElement).toBeInTheDocument();
    await waitFor(() => {
      expect(actuallyRenderedThemeSettings).toEqual(themeFromServer);
    });
  });

  it('should throw an error if theme loading fails', async () => {
    getThemeSettingsByOidMock.mockRejectedValue(new Error('Failed to load theme'));

    const ChildComponent = () => {
      return <div data-testid="child">Child component with invalid theme from server</div>;
    };

    let caughtError: Error | undefined;

    useSisenseContextMock.mockReturnValue({
      app: { httpClient: {} } as any,
      isInitialized: true,
      tracking: {
        enabled: false,
      },
      errorBoundary: {
        showErrorBox: false,
        onError: (error: Error) => {
          caughtError = error;
        },
      },
    });

    render(
      <ThemeProvider theme="invalid_oid">
        <ChildComponent />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(caughtError).toBeInstanceOf(Error);
      expect(caughtError!.message).toBe('Failed to load theme');
    });
  });
});

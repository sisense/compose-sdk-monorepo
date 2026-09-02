import React from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { CompleteThemeSettingsInternal } from '../../../types';
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
    let actuallyRenderedThemeSettings: CompleteThemeSettingsInternal | undefined;
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

    let actuallyRenderedThemeSettings: CompleteThemeSettingsInternal | undefined;
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

    let actuallyRenderedThemeSettings: CompleteThemeSettingsInternal | undefined;
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

  it('should fall back to default theme settings and warn if theme loading fails', async () => {
    getThemeSettingsByOidMock.mockRejectedValue(new Error('Failed to load theme'));
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const onError = vi.fn();
    useSisenseContextMock.mockReturnValue({
      app: { httpClient: {} } as any,
      isInitialized: true,
      tracking: {
        enabled: false,
      },
      errorBoundary: {
        showErrorBox: true,
        onError,
      },
    });

    let actuallyRenderedThemeSettings: CompleteThemeSettingsInternal | undefined;
    const ChildComponent = () => {
      const { themeSettings } = useThemeContext();
      actuallyRenderedThemeSettings = themeSettings;
      return <div data-testid="child">Child component with invalid theme from server</div>;
    };

    render(
      <ThemeProvider theme="invalid_oid" skipTracking>
        <ChildComponent />
      </ThemeProvider>,
    );

    // A theme that cannot be loaded is no longer fatal - children keep rendering.
    const childElement = await screen.findByTestId('child');
    expect(childElement).toBeInTheDocument();

    await waitFor(() => {
      expect(consoleWarnSpy).toHaveBeenCalledOnce();
    });
    expect(consoleWarnSpy.mock.calls[0][0]).toContain('Failed to load theme');
    expect(actuallyRenderedThemeSettings).toEqual(getDefaultThemeSettings());

    // The Sisense context `onError` callback is reserved for fatal errors, since its contract allows
    // returning a React node to replace the failed subtree.
    expect(onError).not.toHaveBeenCalled();
  });

  it('should fall back to parent theme settings when a nested theme oid fails to load', async () => {
    getThemeSettingsByOidMock.mockRejectedValue(new Error('Failed to load theme'));
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    const parentTheme: ThemeSettings = {
      general: {
        brandColor: '#abcdef',
      },
    };

    let actuallyRenderedThemeSettings: CompleteThemeSettingsInternal | undefined;
    const ChildComponent = () => {
      const { themeSettings } = useThemeContext();
      actuallyRenderedThemeSettings = themeSettings;
      return <div data-testid="child">Child component with invalid nested theme</div>;
    };

    render(
      <ThemeProvider theme={parentTheme} skipTracking>
        <ThemeProvider theme="invalid_oid" skipTracking>
          <ChildComponent />
        </ThemeProvider>
      </ThemeProvider>,
    );

    const childElement = await screen.findByTestId('child');
    expect(childElement).toBeInTheDocument();

    // The failed nested theme falls back to the parent theme, not to the default one.
    await waitFor(() => {
      expect(actuallyRenderedThemeSettings).toEqual({
        ...getDefaultThemeSettings(),
        general: {
          ...getDefaultThemeSettings().general,
          brandColor: '#abcdef',
        },
      });
    });
  });

  it('should not crash when the Sisense context provides no tracking config', async () => {
    // `ThemeProvider` sets `shouldSkipSisenseContextWaiting`, so it must tolerate a partial
    // context. Reading `tracking.enabled` unguarded threw during render - including from the
    // tracking effect's dependency array, so no theme failure was needed to trip it - and the
    // error boundary replaced the subtree with an error box.
    useSisenseContextMock.mockReturnValue({
      app: { defaultDataSource: 'someDataSource' },
      isInitialized: true,
      errorBoundary: {
        showErrorBox: true,
      },
    });

    render(
      <ThemeProvider skipTracking>
        <div data-testid="child">Child component without tracking config</div>
      </ThemeProvider>,
    );

    const childElement = await screen.findByTestId('child');
    expect(childElement).toBeInTheDocument();
    expect(screen.queryByLabelText('error-box')).not.toBeInTheDocument();
  });
});

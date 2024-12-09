import { useDashboardTheme } from '@/dashboard/use-dashboard-theme';
import { getDefaultThemeSettings } from '@/theme-provider/default-theme-settings';
import { renderHook } from '@testing-library/react';

vi.mock('@/theme-provider', () => ({
  useThemeContext: () => ({ themeSettings: getDefaultThemeSettings() }),
}));

describe('useDashboardTheme', () => {
  it('should return theme settings with dashboard style', () => {
    const CUSTOM_PALETTE = ['red', 'blue'];
    const { result } = renderHook(() =>
      useDashboardTheme({
        styleOptions: {
          palette: {
            variantColors: CUSTOM_PALETTE,
          },
          backgroundColor: 'backgroundColorTest',
          dividerLineWidth: 100,
          dividerLineColor: 'dividerLineColorTest',
        },
      }),
    );

    const { themeSettings } = result.current;

    expect(themeSettings?.palette?.variantColors).toEqual(CUSTOM_PALETTE);
    expect(themeSettings?.dashboard?.backgroundColor).toBe('backgroundColorTest');
    expect(themeSettings?.dashboard?.dividerLineWidth).toBe(100);
    expect(themeSettings?.dashboard?.dividerLineColor).toBe('dividerLineColorTest');
  });
});

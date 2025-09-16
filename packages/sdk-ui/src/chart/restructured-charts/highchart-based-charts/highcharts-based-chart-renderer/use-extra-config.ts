import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useThemeContext } from '@/theme-provider/theme-context';
import { useSisenseContext } from '@/sisense-context/sisense-context';
import { BuildContext, HighchartBasedChartTypes } from '../types';
import { useDateFormatter } from '@/common/hooks/useDateFormatter';

export function useExtraConfig(): BuildContext<HighchartBasedChartTypes>['extraConfig'] {
  const { app } = useSisenseContext();
  const { t: translate } = useTranslation();
  const { themeSettings } = useThemeContext();
  const dateFormatter = useDateFormatter();

  return useMemo(
    () => ({
      translate,
      themeSettings,
      dateFormatter,
      accessibilityEnabled: app?.settings.accessibilityConfig?.enabled || false,
    }),
    [translate, themeSettings, dateFormatter, app?.settings.accessibilityConfig?.enabled],
  );
}

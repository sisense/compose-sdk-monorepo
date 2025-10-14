import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useDateFormatter } from '@/common/hooks/useDateFormatter';
import { useSisenseContext } from '@/sisense-context/sisense-context';
import { useThemeContext } from '@/theme-provider/theme-context';

import { BuildContext, HighchartBasedChartTypes } from '../types';

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

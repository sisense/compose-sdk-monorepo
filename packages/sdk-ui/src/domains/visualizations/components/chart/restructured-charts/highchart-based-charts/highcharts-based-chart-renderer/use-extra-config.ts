import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';
import { useThemeContext } from '@/infra/contexts/theme-provider/theme-context';
import { useDateFormatter } from '@/shared/hooks/useDateFormatter.js';

import { BuildContext, HighchartBasedChartTypes } from '../types.js';

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

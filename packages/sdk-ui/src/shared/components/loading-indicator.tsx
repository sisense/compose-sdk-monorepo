import { useTranslation } from 'react-i18next';

import { CompleteThemeSettings } from '../../types.js';
import { LoadingDots } from './loading-dots.js';

/**
 * Component that displays a loading indicator.
 *
 * @param props - Loading indicator props.
 * @param props.themeSettings - Theme settings to use for the loading indicator.
 * @param props.onCancel - Function to call when cancel is clicked.
 * @returns A loading indicator with optional cancel.
 *
 * @deprecated Use LoadingOverlay instead.
 * @internal
 */
export const LoadingIndicator = ({
  themeSettings,
  onCancel,
}: {
  themeSettings?: CompleteThemeSettings;
  onCancel?: () => void;
}) => {
  const { t } = useTranslation();
  const backgroundColor = themeSettings?.chart.backgroundColor
    ? { backgroundColor: themeSettings.chart.backgroundColor }
    : undefined;

  return (
    <div
      style={backgroundColor}
      className="csdk-h-full csdk-bg-white csdk-p-[20px]"
      aria-label="csdk-loading-indicator"
    >
      <div
        style={backgroundColor}
        className="csdk-h-full csdk-bg-background-priority csdk-flex csdk-flex-col csdk-gap-y-4 csdk-items-center csdk-justify-center"
      >
        <LoadingDots color={themeSettings?.chart.textColor} />
        {onCancel && (
          <div
            className="csdk-text-ai-sm csdk-text-text-link csdk-cursor-pointer"
            onClick={onCancel}
          >
            {t('cancel')}
          </div>
        )}
      </div>
    </div>
  );
};

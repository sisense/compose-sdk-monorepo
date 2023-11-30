import LoadingIcon from '../icons/loading-icon';
import { CompleteThemeSettings } from '../../types';

/**
 * Component that displays a loading indicator.
 *
 * @param onCancel - Function to call when cancel is clicked.
 * @returns A loading indicator with optional cancel.
 */
export const LoadingIndicator = ({
  themeSettings,
  onCancel,
}: {
  themeSettings?: CompleteThemeSettings;
  onCancel?: () => void;
}) => {
  const backgroundColor = themeSettings?.chart.backgroundColor
    ? { backgroundColor: themeSettings.chart.backgroundColor }
    : undefined;
  const panelBackgroundColor = themeSettings?.chart.panelBackgroundColor
    ? { backgroundColor: themeSettings.chart.panelBackgroundColor }
    : undefined;

  return (
    <div style={backgroundColor} className="csdk-h-full csdk-bg-white csdk-p-[20px]">
      <div
        style={panelBackgroundColor}
        className="csdk-h-full csdk-bg-background-priority csdk-flex csdk-flex-col csdk-gap-y-4 csdk-items-center csdk-justify-center"
      >
        <LoadingIcon spin={true} />
        {onCancel && (
          <div
            className="csdk-text-ai-sm csdk-text-text-link csdk-cursor-pointer"
            onClick={onCancel}
          >
            {'Cancel'}
          </div>
        )}
      </div>
    </div>
  );
};

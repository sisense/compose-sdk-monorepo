import { ReactNode } from 'react';
import { CompleteThemeSettings } from '../../types';
import { LoadingDots } from './loading-dots';

/**
 * Component that displays a loading overlay.
 * Overlay is active when query is executed within a chart.
 *
 * @param isVisible - visibility of the overlay.
 * @returns Child component wrapped in dynamic overlay.
 */
export const LoadingOverlay = ({
  isVisible,
  themeSettings,
  children,
}: {
  isVisible: boolean;
  themeSettings: CompleteThemeSettings;
  children: ReactNode;
}) => {
  const panelBackgroundColor = themeSettings?.chart.panelBackgroundColor
    ? { backgroundColor: themeSettings.chart.panelBackgroundColor }
    : undefined;

  return (
    <div id="overlay" className="csdk-relative csdk-h-full">
      {isVisible && (
        // z-index is set to 401, which is higher than max z-index of 400 on areamap
        <div className="csdk-absolute csdk-h-full csdk-w-full csdk-z-[401] csdk-opacity-80">
          <div className={`csdk-h-full csdk-bg-transparent`}>
            <div
              className={`csdk-h-full csdk-flex csdk-flex-col csdk-gap-y-4 csdk-items-center csdk-justify-center csdk-bg-transparent`}
            >
              <div
                style={panelBackgroundColor}
                className="csdk-p-1.5 csdk-bg-background-priority csdk-rounded-full"
              >
                <LoadingDots color={themeSettings?.chart.textColor} />
              </div>
            </div>
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

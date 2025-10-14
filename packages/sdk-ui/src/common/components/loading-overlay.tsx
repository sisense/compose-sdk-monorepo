import { ReactNode } from 'react';

import { useThemeContext } from '@/theme-provider';

import { LoadingDots } from './loading-dots';

/**
 * Component that displays a loading overlay.
 * Overlay is active when query is executed within a chart.
 *
 * @param isVisible - visibility of the overlay.
 * @returns Child component wrapped in dynamic overlay.
 * @internal
 */
export const LoadingOverlay = ({
  isVisible,
  children,
}: {
  isVisible: boolean;
  children: ReactNode;
}) => {
  const { themeSettings } = useThemeContext();
  return (
    <div id="overlay" className="csdk-relative csdk-h-full">
      {isVisible && (
        // z-index is set to 401, which is higher than max z-index of 400 on areamap
        <div
          className="csdk-absolute csdk-h-full csdk-w-full csdk-z-[401] csdk-opacity-80"
          aria-label="csdk-loading-overlay"
        >
          <div className={`csdk-h-full csdk-bg-transparent`}>
            <div
              className={`csdk-h-full csdk-flex csdk-flex-col csdk-gap-y-4 csdk-items-center csdk-justify-center csdk-bg-transparent`}
            >
              <div
                style={{ backgroundColor: themeSettings.general.backgroundColor }}
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

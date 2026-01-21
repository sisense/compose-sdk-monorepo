/* eslint-disable rulesdir/opacity-zero-needs-focus-visible */
import { ReactNode } from 'react';

import { useSisenseContext } from '@/sisense-context/sisense-context';
import styled from '@/styled';
import { useThemeContext } from '@/theme-provider';

import { LoadingDots } from './loading-dots';

const LoaderWrapper = styled.div<{ delay: number }>`
  opacity: 0;
  // z-index is set to 401, which is higher than max z-index of 400 on areamap
  z-index: 401;
  width: 100%;
  height: 100%;
  position: absolute;
  animation: fadeIn 0.3s ease-in-out forwards;
  animation-delay: ${({ delay }) => delay}ms;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 0.8;
    }
  }
`;

/**
 * Component that displays a loading overlay.
 *
 * @param isVisible - visibility of the overlay (not work if loading indicator is disabled in app config).
 * @returns Child component wrapped in dynamic overlay.
 * @internal
 */
export const LoadingOverlay = ({
  isVisible = true,
  children,
}: {
  isVisible?: boolean;
  children?: ReactNode;
}) => {
  const { app } = useSisenseContext();
  const isLoaderEnabled = app?.settings?.loadingIndicatorConfig?.enabled ?? true;
  const shouldShowLoader = isLoaderEnabled && isVisible;
  const loaderDelay = app?.settings?.loadingIndicatorConfig?.delay ?? 0;
  const { themeSettings } = useThemeContext();
  return (
    <div id="overlay" className="csdk-relative csdk-h-full">
      {shouldShowLoader && (
        <LoaderWrapper delay={loaderDelay} aria-label="csdk-loading-overlay">
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
        </LoaderWrapper>
      )}
      {children}
    </div>
  );
};

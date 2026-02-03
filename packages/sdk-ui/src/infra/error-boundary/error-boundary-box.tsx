import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AbstractTranslatableError } from '@sisense/sdk-common';

import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';
import { useThemeContext } from '@/infra/contexts/theme-provider/theme-context';
import { DEFAULT_TEXT_COLOR } from '@/shared/const';
import ExclamationMarkIcon from '@/shared/icons/exclamation-mark-icon';

import { TranslatableError } from '../translation/translatable-error';
import styles from './error-boundary-box.module.scss';

/**
 * This component is used to display an error message when a component fails to render.
 * It is used by the ErrorBoundary component.
 *
 * @param props - component properties
 * @param props.error - The error to translate and display
 * @returns A component which will replace the component when it fails to render
 */
const ErrorBoundaryBox = ({
  error = new TranslatableError('errors.componentRenderError'),
}: {
  error: Error | AbstractTranslatableError | string;
}) => {
  const { themeSettings } = useThemeContext();
  const { app } = useSisenseContext();
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const icon = (
    <div className="csdk-flex csdk-justify-center csdk-mb-[10px]">
      <ExclamationMarkIcon color={themeSettings?.general?.brandColor} />
    </div>
  );

  const errorMessage: string =
    error instanceof AbstractTranslatableError
      ? t(error.key, {
          ...error.interpolationOptions,
        })
      : t(error instanceof Error ? error.message : error);

  const errorText = t('errorBoxText', {
    errorMessage,
    interpolation: { escapeValue: false },
  });

  const isTextAlwaysVisible = app?.settings?.errorBoundaryConfig?.alwaysShowErrorText;

  return (
    <div
      onMouseEnter={isTextAlwaysVisible ? undefined : handleMouseEnter}
      onMouseLeave={isTextAlwaysVisible ? undefined : handleMouseLeave}
      className={styles.container}
      aria-label="error-box"
    >
      <div
        className={styles.card}
        style={{
          backgroundColor: themeSettings?.general?.backgroundColor || 'rgba(255,255,255,0.5)',
        }}
      >
        {icon}
        {(isTextAlwaysVisible || isHovered) && (
          <div
            className={styles.text}
            style={{
              color: themeSettings?.typography?.primaryTextColor || DEFAULT_TEXT_COLOR,
              fontFamily: themeSettings?.typography?.fontFamily || 'inherit',
            }}
          >
            {errorText}
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorBoundaryBox;

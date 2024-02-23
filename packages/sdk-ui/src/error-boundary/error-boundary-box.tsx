import { useState } from 'react';
import styles from './error-boundary-box.module.scss';
import { useTranslation } from 'react-i18next';
import { AbstractTranslatableError } from '@sisense/sdk-common';
import { TranslatableError } from '../translation/translatable-error';
import YellowExclamationMarkIcon from '@/common/icons/yellow-exclamation-mark-icon';

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
      <YellowExclamationMarkIcon />
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
  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={styles.container}
      aria-label="error-box"
    >
      <div className={styles.card}>
        {icon}
        {isHovered && <div className={styles.text}>{errorText}</div>}
      </div>
    </div>
  );
};

export default ErrorBoundaryBox;

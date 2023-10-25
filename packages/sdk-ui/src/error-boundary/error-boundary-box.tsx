import { useState } from 'react';
import styles from './error-boundary-box.module.scss';
import { useTranslation } from 'react-i18next';
import { AbstractTranslatableError } from '@sisense/sdk-common';
import { TranslatableError } from '../translation/translatable-error';

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
    <div className={styles.icon} title="">
      <svg width="53px" height="53px" viewBox="0 0 53 53">
        <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
          <g>
            <polygon points="26.4996 -0.000100000005 -0.000400000001 26.5009 26.4996 52.9999 53.0006 26.5009"></polygon>
            <path
              d="M24.5,39.054 L24.5,35.054 L28.5,35.054 L28.5,39.054 L24.5,39.054 Z M28.5,31.0536 L24.5,31.0536 L23.5,13.0536 L29.5,13.0536 L28.5,31.0536 Z"
              fill="#FFFFFF"
            ></path>
          </g>
        </g>
      </svg>
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

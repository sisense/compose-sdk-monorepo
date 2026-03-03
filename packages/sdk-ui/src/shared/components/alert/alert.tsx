import { ReactNode } from 'react';

import { useThemeContext } from '@/infra/contexts/theme-provider';
import { AlertIcon } from '@/shared/icons/alert-icon';
import { CloseIcon } from '@/shared/icons/close-icon';
import { getDarkFactor, toColor } from '@/shared/utils/color';

import styles from './alert.module.scss';

/**
 * Props for Alert component
 */
export interface AlertProps {
  /**
   * Variant of the alert
   */
  variant?: 'error' | 'warning' | 'info';
  /**
   * Title text displayed in the alert
   */
  title?: string;
  /**
   * Description text displayed in the alert
   */
  description?: string;
  /**
   * Custom icon to display. If not provided, AlertIcon is used
   */
  icon?: ReactNode;
  /**
   * Whether the alert can be dismissed
   */
  dismissible?: boolean;
  /**
   * Callback when alert is dismissed
   */
  onDismiss?: () => void;
  /**
   * When true and dismissible, clicking anywhere on the alert (not just the close button)
   * triggers onDismiss. Useful for banner-style alerts.
   *
   * @default false
   */
  dismissOnClick?: boolean;
  /**
   * Additional CSS class name
   */
  className?: string;
}

/**
 * Alert component for displaying warnings, errors, and informational messages
 *
 * @param props - Alert component props
 * @returns Alert component
 * @internal
 */
export const Alert = ({
  variant = 'info',
  title,
  description,
  icon,
  dismissible = false,
  onDismiss,
  dismissOnClick = false,
  className = '',
}: AlertProps) => {
  const hasIcon = true; // Always show icon
  const displayIcon = icon || <AlertIcon width="16" height="16" />;
  const { themeSettings } = useThemeContext();
  const backgroundColor = themeSettings.general.backgroundColor;

  const isDarkMode = getDarkFactor(toColor(backgroundColor)) > 0.5;

  const handleDismiss = () => {
    onDismiss?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDismiss();
    }
  };

  const isClickable = dismissOnClick && dismissible && onDismiss;

  const alertContent = (
    <>
      {hasIcon && <div className={styles.icon}>{displayIcon}</div>}
      <div className={styles.content} {...(isClickable && { role: 'alert' as const })}>
        {title && <div className={styles.title}>{title}</div>}
        {description && <div className={styles.description}>{description}</div>}
      </div>
      {dismissible &&
        onDismiss &&
        (isClickable ? (
          <span className={styles.dismissButton} aria-hidden>
            <CloseIcon />
          </span>
        ) : (
          <button
            type="button"
            className={styles.dismissButton}
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            onKeyDown={handleKeyDown}
            aria-label="Dismiss alert"
          >
            <CloseIcon />
          </button>
        ))}
    </>
  );

  const sharedProps = {
    'data-dark-mode': isDarkMode,
    'data-dismiss-on-click': isClickable ? 'true' : undefined,
    className: `${styles.alert} ${styles[variant]} ${hasIcon ? styles.hasIcon : ''} ${className}`,
  };

  if (isClickable) {
    return (
      <button
        type="button"
        {...sharedProps}
        onClick={handleDismiss}
        onKeyDown={handleKeyDown}
        aria-label="Dismiss alert"
      >
        {alertContent}
      </button>
    );
  }

  return (
    <div role="alert" {...sharedProps}>
      {alertContent}
    </div>
  );
};

/**
 * Props for AlertTitle component
 */
export interface AlertTitleProps {
  /**
   * Content of the title
   */
  children: ReactNode;
  /**
   * Additional CSS class name
   */
  className?: string;
}

/**
 * Alert title subcomponent
 *
 * @param props - AlertTitle props
 * @returns AlertTitle component
 * @internal
 */
export const AlertTitle = ({ children, className = '' }: AlertTitleProps) => {
  return <div className={`${styles.title} ${className}`}>{children}</div>;
};

/**
 * Props for AlertDescription component
 */
export interface AlertDescriptionProps {
  /**
   * Content of the description
   */
  children: ReactNode;
  /**
   * Additional CSS class name
   */
  className?: string;
}

/**
 * Alert description subcomponent
 *
 * @param props - AlertDescription props
 * @returns AlertDescription component
 * @internal
 */
export const AlertDescription = ({ children, className = '' }: AlertDescriptionProps) => {
  return <div className={`${styles.description} ${className}`}>{children}</div>;
};

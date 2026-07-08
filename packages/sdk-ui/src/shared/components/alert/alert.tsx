import { ReactNode } from 'react';

import { AlertIcon } from '@/shared/icons/alert-icon';
import { CloseIcon } from '@/shared/icons/close-icon';

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
  className = '',
}: AlertProps) => {
  const displayIcon = icon || <AlertIcon />;

  const handleDismiss = () => {
    onDismiss?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDismiss();
    }
  };

  return (
    <div role="alert" className={`${styles.alert} ${styles[variant]} ${className}`}>
      <div className={styles.icon}>{displayIcon}</div>
      <div className={styles.content}>
        {title && <div className={styles.title}>{title}</div>}
        {description && <div className={styles.description}>{description}</div>}
      </div>
      {dismissible && onDismiss && (
        <button
          type="button"
          className={styles.dismissButton}
          onClick={handleDismiss}
          onKeyDown={handleKeyDown}
          aria-label="Dismiss alert"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
};

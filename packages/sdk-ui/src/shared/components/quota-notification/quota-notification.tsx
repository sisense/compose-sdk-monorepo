import { useTranslation } from 'react-i18next';

import { WarningIcon } from '@/shared/icons/warning-icon.js';
import { XCircleIcon } from '@/shared/icons/x-circle-icon.js';

import {
  type QuotaNotificationOptions,
  useQuotaNotification,
} from '../../hooks/use-quota-notification.js';
import { useQuotaWarningDismissed } from '../../hooks/use-quota-warning-dismissed.js';
import { Alert } from '../alert/index.js';
import styles from './quota-notification.module.scss';

/**
 * Props for QuotaNotification component
 *
 * @sisenseInternal
 */
export interface QuotaNotificationProps extends QuotaNotificationOptions {
  /**
   * Additional CSS class name
   */
  className?: string;
  /**
   * Whether the warning banner has been dismissed (controlled from parent)
   */
  warningDismissed?: boolean;
  /**
   * Callback when warning is dismissed (for controlled usage)
   */
  onDismissWarning?: () => void;
}

/**
 * Component that displays credit balance warnings/errors
 *
 * Shows an error banner when credit is exceeded (not dismissible).
 * Shows a warning banner when credit usage >= warningThreshold (dismissible).
 * Automatically updates via polling every 60 seconds.
 *
 * @param props - QuotaNotification props
 * @returns QuotaNotification component or null
 * @sisenseInternal
 */
export function QuotaNotification({
  className = '',
  warningDismissed: controlledWarningDismissed,
  onDismissWarning,
  enabled = true,
  warningThreshold,
  exceededThreshold,
}: QuotaNotificationProps = {}) {
  const { t } = useTranslation();
  const {
    enabled: effectiveEnabled,
    quotaState,
    isLoading,
  } = useQuotaNotification({
    enabled,
    warningThreshold,
    exceededThreshold,
  });
  const [persistedDismissed, setPersistedDismissed] = useQuotaWarningDismissed();

  // Use controlled state if provided, otherwise use sessionStorage-persisted state
  const warningDismissed =
    controlledWarningDismissed !== undefined ? controlledWarningDismissed : persistedDismissed;

  const handleDismissWarning = () => {
    if (onDismissWarning) {
      onDismissWarning();
      // In callback-only mode (controlledWarningDismissed undefined), update persisted state
      if (controlledWarningDismissed === undefined) {
        setPersistedDismissed(true);
      }
    } else {
      setPersistedDismissed(true);
    }
  };

  if (!effectiveEnabled || isLoading || !quotaState) {
    return null;
  }

  // Show error banner when credit is exceeded (always show, not dismissible)
  if (quotaState.isExceeded) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.bannerWrapper} data-variant="error">
          <Alert
            variant="error"
            icon={<XCircleIcon width="16" height="16" />}
            title={t('ai.quota.exceededErrorTitle')}
            description={t('ai.quota.exceededErrorDescription')}
            dismissible={false}
          />
        </div>
      </div>
    );
  }

  // Show warning banner when credit usage >= warningThreshold (dismissible)
  if (quotaState.isWarning && !warningDismissed) {
    return (
      <div className={`${styles.container} ${styles.containerClickable} ${className}`}>
        <div className={styles.bannerWrapper} data-variant="warning">
          <Alert
            variant="warning"
            icon={<WarningIcon width="16" height="16" />}
            description={t('ai.quota.warningDescription', {
              usagePercentage: Math.round(quotaState.usagePercentage),
            })}
            dismissible={true}
            dismissOnClick={true}
            onDismiss={handleDismissWarning}
          />
        </div>
      </div>
    );
  }

  return null;
}

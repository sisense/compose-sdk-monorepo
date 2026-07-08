import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { WarningIcon } from '@/shared/icons/warning-icon.js';
import { XCircleIcon } from '@/shared/icons/x-circle-icon.js';

import {
  type QuotaNotificationOptions,
  useQuotaNotification,
} from '../../hooks/use-quota-notification.js';
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
}

/**
 * Component that displays credit balance warnings/errors
 *
 * Shows an error banner when credit is exceeded (not dismissible).
 * Shows a warning banner when credit usage >= warningThreshold (dismissible via close button,
 * resets each time the assistant loads).
 * Automatically updates via polling every 60 seconds.
 *
 * @param props - QuotaNotification props
 * @returns QuotaNotification component or null
 * @sisenseInternal
 */
export function QuotaNotification({
  className = '',
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
  const [warningDismissed, setWarningDismissed] = useState(false);

  if (!effectiveEnabled || isLoading || !quotaState) {
    return null;
  }

  // Show error banner when credit is exceeded (always show, not dismissible)
  if (quotaState.isExceeded) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.bannerWrapper}>
          <Alert
            variant="error"
            icon={<XCircleIcon />}
            title={t('ai.quota.exceededErrorTitle')}
            description={t('ai.quota.exceededErrorDescription')}
            dismissible={false}
          />
        </div>
      </div>
    );
  }

  // Show warning banner when credit usage >= warningThreshold (dismissible, resets each load)
  if (quotaState.isWarning && !warningDismissed) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.bannerWrapper}>
          <Alert
            variant="warning"
            icon={<WarningIcon />}
            description={t('ai.quota.warningDescription', {
              usagePercentage: Math.round(quotaState.usagePercentage),
            })}
            dismissible={true}
            onDismiss={() => setWarningDismissed(true)}
          />
        </div>
      </div>
    );
  }

  return null;
}

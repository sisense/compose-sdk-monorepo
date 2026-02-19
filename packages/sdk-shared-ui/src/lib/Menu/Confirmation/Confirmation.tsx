import React from 'react';

import ClassNames from 'classnames';

// todo: add translations support
// import { FormattedMessage } from 'react-intl';
import { styleguideConstants } from '../../constants/styleguideConstants';
import styles from './Confirmation.module.scss';

// import messages from './translation';

export const Confirmation = ({
  message,
  title,
  onCancel,
  onConfirm,
}: {
  message: string;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
}) => {
  const confirmClasses = ClassNames(styles.button, styles.confirm);
  const cancelClasses = ClassNames(styles.button, styles.cancel);

  return (
    <div className={styles.container}>
      <div className={styles.title}>{title}</div>
      <div className={ClassNames(styles.message, styleguideConstants.TEXT_SECONDARY)}>
        {message}
      </div>
      <div className={styles.buttons}>
        <button className={confirmClasses} onClick={onConfirm}>
          {/* eslint-disable-next-line i18next/no-literal-string */}
          {/*<FormattedMessage {...messages.yes} />*/}
          Yes
        </button>
        <button className={cancelClasses} onClick={onCancel}>
          {/* eslint-disable-next-line i18next/no-literal-string */}
          {/* <FormattedMessage {...messages.no} /> */}
          No
        </button>
      </div>
    </div>
  );
};

import { LineSubtype } from '@sisense/sdk-ui';
import classnames from 'classnames';

import { messages, useIntl } from '../shared/use-intl';
import styles from './LineTypeSection.module.scss';

const LINE_BASIC: LineSubtype = 'line/basic';
const LINE_SPLINE: LineSubtype = 'line/spline';

export const LineTypeSection = ({
  lineType,
  onClick,
}: {
  lineType?: LineSubtype;
  onClick: (lineType: LineSubtype) => void;
}) => {
  const intl = useIntl();
  return (
    <div>
      <div className={styles.title}>{intl.formatMessage(messages.lineType)}</div>
      <div className={styles.lineTypeContainer}>
        <button
          type="button"
          className={classnames(styles.lineTypeOption, {
            [styles.hoverEffect]: lineType !== LINE_BASIC,
          })}
          aria-pressed={lineType === LINE_BASIC}
          onClick={() => onClick(LINE_BASIC)}
        >
          <div className={styles.center}>
            <div
              className={classnames(styles.straightLine, {
                [styles.selected]: lineType === LINE_BASIC,
              })}
            />
            <div className={styles.straightText}>{intl.formatMessage(messages.straight)}</div>
          </div>
        </button>
        <button
          type="button"
          className={classnames(styles.lineTypeOption, {
            [styles.hoverEffect]: lineType !== LINE_SPLINE,
          })}
          aria-pressed={lineType === LINE_SPLINE}
          onClick={() => onClick(LINE_SPLINE)}
        >
          <div className={styles.center}>
            <div
              className={classnames(styles.smoothLine, {
                [styles.selected]: lineType === LINE_SPLINE,
              })}
            />
            <div className={styles.smoothText}>{intl.formatMessage(messages.smooth)}</div>
          </div>
        </button>
      </div>
    </div>
  );
};

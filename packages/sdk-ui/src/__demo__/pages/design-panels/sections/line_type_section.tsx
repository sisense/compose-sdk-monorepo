import styles from './line_type_section.module.scss';
import classnames from 'classnames';
import { messages, useIntl } from './use-intl';
import { LineSubtype } from '@/types';

export const LineTypeSection = ({
  lineType,
  onClick,
}: {
  lineType?: LineSubtype;
  onClick: (lineType: LineSubtype) => void;
}) => {
  const intl = useIntl();
  console.log('DEBUG lineType', lineType, messages.lineType, intl.formatMessage(messages.lineType));
  return (
    <div>
      <div className={styles.title}>{intl.formatMessage(messages.lineType)}</div>
      <table className={styles.lineTypeTable}>
        <tbody>
          <tr>
            <td
              className={classnames('', {
                [styles.hoverEffect]: lineType === 'line/spline',
              })}
              onClick={() => {
                onClick('line/basic');
              }}
            >
              <div className={styles.center}>
                <div
                  className={classnames(styles.straightLine, {
                    [styles.selected]: lineType === 'line/basic',
                  })}
                />
                <div className={styles.straightText}>{intl.formatMessage(messages.straight)}</div>
              </div>
            </td>
            <td
              className={classnames('', {
                [styles.hoverEffect]: lineType === 'line/basic',
              })}
              onClick={() => {
                onClick('line/spline');
              }}
            >
              <div className={styles.center}>
                <div
                  className={classnames(styles.smoothLine, {
                    [styles.selected]: lineType === 'line/spline',
                  })}
                />
                <div className={styles.smoothText}>{intl.formatMessage(messages.smooth)}</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

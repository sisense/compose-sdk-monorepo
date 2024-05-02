/* eslint-disable sonarjs/no-redundant-boolean */
import styles from './indicator_type_section.module.scss';
import classnames from 'classnames';
import { messages, useIntl } from './use-intl';

export const IndicatorTypeSection = ({
  indicatorType,
  onClick,
}: {
  indicatorType: any;
  onClick: (indicatorType: any) => void;
}) => {
  const intl = useIntl();
  return (
    <div>
      <div className={styles.title}>{intl.formatMessage(messages.indicatorType)}</div>
      <table className={styles.table}>
        <tbody>
          <tr>
            <td
              className={styles.hoverEffect}
              onClick={() => {
                onClick('numericSimple');
              }}
            >
              <div className={styles.center}>
                <div
                  className={classnames(styles.numeric, {
                    [styles.selected]: indicatorType !== 'gauge',
                  })}
                >
                  {'123'}
                </div>
                <div className={styles.numericText}>{intl.formatMessage(messages.numeric)}</div>
              </div>
            </td>
            ={' '}
            {false && (
              <td
                className={styles.hoverEffect}
                onClick={() => {
                  onClick('gauge');
                }}
              >
                <div className={styles.center}>
                  <div
                    className={classnames(styles.gauge, {
                      [styles.selected]: indicatorType === 'gauge',
                    })}
                  />
                  <div className={styles.gaugeText}>{intl.formatMessage(messages.gauge)}</div>
                </div>
              </td>
            )}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

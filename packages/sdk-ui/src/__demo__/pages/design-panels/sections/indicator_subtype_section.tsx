import styles from './indicator_subtype_section.module.scss';
import classnames from 'classnames';
import { useIntl } from './use-intl';
import { messages } from './use-intl';

export const IndicatorSubtypeSection = ({
  indicatorType,
  onClick,
}: {
  indicatorType: any;
  onClick: (indicatorType: any) => void;
}) => {
  const intl = useIntl();
  return (
    <div>
      <div className={styles.title}>{intl.formatMessage(messages.indicatorSubtype)}</div>
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
                    [styles.selected]: indicatorType === 'numericSimple',
                  })}
                >
                  {'678'}
                </div>
                <div className={styles.numericText}>{intl.formatMessage(messages.simple)}</div>
              </div>
            </td>
            <td
              className={styles.hoverEffect}
              onClick={() => {
                onClick('numericBar');
              }}
            >
              <div className={styles.center}>
                <div
                  className={classnames(styles.bar, {
                    [styles.selected]: indicatorType === 'numericBar',
                  })}
                >
                  {'678'}
                </div>
                <div className={styles.barText}>{intl.formatMessage(messages.bar)}</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

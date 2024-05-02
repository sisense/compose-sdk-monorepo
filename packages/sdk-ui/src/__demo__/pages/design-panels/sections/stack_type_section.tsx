import styles from './stack_type_section.module.scss';
import classnames from 'classnames';
import { capitalize } from 'lodash';
import { useIntl, messages } from './use-intl';
import { ChartType } from '@/types';
import {
  LineType,
  StackType,
} from '@/chart-options-processor/translations/translations-to-highcharts';

export const StackTypeSection = ({
  chartType,
  isStackingPossible,
  stackType,
  lineType,
  onClick,
}: {
  chartType: ChartType;
  isStackingPossible: boolean;
  stackType: StackType;
  lineType: LineType;
  onClick: (stackType: StackType) => void;
}) => {
  const intl = useIntl();
  const title = `${capitalize(chartType)} Type`;
  return (
    <div>
      <div className={styles.title}>{title}</div>
      <table className={styles.stackTypeTable}>
        <tbody>
          <tr>
            <td
              className={classnames(styles.enabled, {
                [styles.hoverEffect]: stackType !== 'classic',
                [styles.selected]: stackType === 'classic',
              })}
              onClick={() => {
                onClick('classic');
              }}
            >
              <div className={classnames(styles.center)}>
                <div
                  className={classnames(
                    styles[chartType],
                    styles.icon,
                    styles.classic,
                    styles[lineType],
                  )}
                ></div>
                <div>{intl.formatMessage(messages.classic)}</div>
              </div>
            </td>
            <td
              className={classnames('', {
                [styles.enabled]: isStackingPossible,
                [styles.hoverEffect]: stackType !== 'stacked' && isStackingPossible,
                [styles.selected]: stackType === 'stacked',
              })}
              onClick={() => {
                if (isStackingPossible) {
                  onClick('stacked');
                }
              }}
            >
              <div className={classnames(styles.center)}>
                <div
                  className={classnames(
                    styles[chartType],
                    styles.icon,
                    styles.stacked,
                    styles[lineType],
                  )}
                ></div>
                <div>{intl.formatMessage(messages.stacked)}</div>
              </div>
            </td>
            <td
              className={classnames('', {
                [styles.enabled]: isStackingPossible,
                [styles.hoverEffect]: stackType !== 'stack100' && isStackingPossible,
                [styles.selected]: stackType === 'stack100',
              })}
              onClick={() => {
                if (isStackingPossible) {
                  onClick('stack100');
                }
              }}
            >
              <div className={classnames(styles.center)}>
                <div
                  className={classnames(
                    styles[chartType],
                    styles.icon,
                    styles.stack100,
                    styles[lineType],
                  )}
                ></div>
                <div>{intl.formatMessage(messages.stack100)}</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

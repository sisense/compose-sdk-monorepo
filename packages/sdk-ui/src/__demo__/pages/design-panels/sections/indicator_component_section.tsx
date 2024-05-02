import { IndicatorComponents } from '@/types';
import styles from './indicator_component_section.module.scss';
import { IndicatorStyleType } from '@/chart-options-processor/translations/design-options';
import { messages, useIntl } from './use-intl';
import { Checkbox } from '@/filters/components/common';

export const IndicatorComponentSection = ({
  indicatorType,
  indicatorComponents,
  onClick,
}: {
  indicatorType: IndicatorStyleType;
  indicatorComponents: IndicatorComponents;
  onClick: (indicatorComponents: any) => void;
}) => {
  const intl = useIntl();
  return (
    <div>
      <div className={styles.title}>{intl.formatMessage(messages.components)}</div>
      <table className={styles.axisTable}>
        <tbody>
          {indicatorType === 'gauge' && (
            <tr
              onClick={() =>
                onClick({
                  ...indicatorComponents,
                  showTicks: !indicatorComponents?.ticks?.shouldBeShown,
                })
              }
            >
              <td className={styles.checkBoxTD}>
                <div className={styles.center}>
                  <Checkbox checked={indicatorComponents?.ticks?.shouldBeShown} />
                </div>
              </td>
              <td>
                <div className={styles.label}>{intl.formatMessage(messages.ticks)}</div>
              </td>
            </tr>
          )}
          {indicatorType === 'gauge' && (
            <tr
              onClick={() =>
                onClick({
                  ...indicatorComponents,
                  showLabels: !indicatorComponents?.labels?.shouldBeShown,
                })
              }
            >
              <td className={styles.checkBoxTD}>
                <div className={styles.center}>
                  <Checkbox checked={indicatorComponents?.labels?.shouldBeShown} />
                </div>
              </td>
              <td>
                <div className={styles.label}>{intl.formatMessage(messages.labels)}</div>
              </td>
            </tr>
          )}
          <tr
            onClick={() =>
              onClick({
                ...indicatorComponents,
                showTitle: !indicatorComponents?.title?.shouldBeShown,
              })
            }
          >
            <td className={styles.checkBoxTD}>
              <div className={styles.center}>
                <Checkbox checked={!!indicatorComponents?.title?.text} />
              </div>
            </td>
            <td>
              <div className={styles.label}>{intl.formatMessage(messages.title)}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

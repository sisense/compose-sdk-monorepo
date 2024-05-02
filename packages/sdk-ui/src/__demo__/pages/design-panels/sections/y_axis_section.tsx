/* eslint-disable @typescript-eslint/no-explicit-any */
import styles from './y_axis_section.module.scss';
import { TogglerSection } from './toggler_section';
import classnames from 'classnames';
import { messages, useIntl } from './use-intl';
import { Checkbox } from '@/filters/components/common';
import { AxisLabel } from '@/types';

export const YAxisSection = ({
  yAxis,
  onClick,
  sectionTitle,
  hasGridLine,
  hasRange,
}: {
  yAxis?: AxisLabel;
  onClick: (yAxis: AxisLabel) => void;
  sectionTitle: string;
  hasGridLine: boolean;
  hasRange: boolean;
}) => {
  const showLogarithmic = hasRange;
  const showMin = hasRange;
  const showMax = hasRange;
  const intl = useIntl();
  return (
    <div>
      <TogglerSection
        label={intl.formatMessage(sectionTitle)}
        checked={!!yAxis?.enabled}
        onClick={() => {
          onClick({
            ...yAxis,
            enabled: !yAxis?.enabled,
          });
        }}
      />
      {yAxis?.enabled && (
        <table className={styles.axisTable}>
          <tbody>
            {hasGridLine && (
              <tr
                onClick={() =>
                  onClick({
                    ...yAxis,
                    gridLines: !yAxis?.gridLines,
                  })
                }
              >
                <td className={styles.checkBoxTD}>
                  <div className={styles.center}>
                    <Checkbox checked={!!yAxis?.gridLines} />
                  </div>
                </td>
                <td>
                  <div className={styles.label}>{intl.formatMessage(messages.gridLines)}</div>
                </td>
              </tr>
            )}
            {showLogarithmic && (
              <tr
                onClick={() =>
                  onClick({
                    ...yAxis,
                    logarithmic: !yAxis.logarithmic,
                    isIntervalEnabled: !yAxis.logarithmic,
                    intervalJumps: !yAxis.logarithmic ? undefined : yAxis.intervalJumps,
                  })
                }
              >
                <td className={styles.checkBoxTD}>
                  <div className={styles.center}>
                    <Checkbox checked={yAxis.logarithmic} />
                  </div>
                </td>
                <td>
                  <div className={styles.label}>{intl.formatMessage(messages.logarithmic)}</div>
                </td>
              </tr>
            )}
            <tr
              onClick={() =>
                onClick({
                  ...yAxis,
                  labels: { enabled: !yAxis.labels?.enabled },
                })
              }
            >
              <td className={styles.checkBoxTD}>
                <div className={styles.center}>
                  <Checkbox checked={!!yAxis.labels?.enabled} />
                </div>
              </td>
              <td>
                <div className={styles.label}>{intl.formatMessage(messages.labels)}</div>
              </td>
            </tr>
            <tr>
              <td
                className={styles.checkBoxTD}
                onClick={() =>
                  onClick({
                    ...yAxis,
                    title: { ...yAxis?.title, enabled: !yAxis?.title?.enabled },
                  })
                }
              >
                <div className={styles.center}>
                  <Checkbox checked={!!yAxis?.title?.enabled} />
                </div>
              </td>
              <td>
                <div className={styles.inputSection}>
                  <div
                    className={styles.inputLabel}
                    onClick={() =>
                      onClick({
                        ...yAxis,
                        title: { ...yAxis?.title, enabled: !yAxis?.title?.enabled },
                      })
                    }
                  >
                    {intl.formatMessage(messages.title)}
                  </div>
                  <input
                    className={classnames(styles.input, {
                      [styles.disabled]: !yAxis?.title?.enabled,
                    })}
                    value={yAxis?.title?.text ?? ''}
                    onFocus={() => {
                      if (!yAxis?.title?.enabled) {
                        onClick({
                          ...yAxis,
                          title: { ...yAxis?.title, enabled: true },
                        });
                      }
                    }}
                    onChange={(event: any) => {
                      onClick({
                        ...yAxis,
                        title: { ...yAxis?.title, text: event.target.value, enabled: true },
                      });
                    }}
                  />
                </div>
              </td>
            </tr>
            {showMin && (
              <tr>
                <td className={styles.checkBoxTD}></td>
                <td>
                  <div className={styles.inputSection}>
                    <div className={styles.inputLabel}>{intl.formatMessage(messages.min)}</div>
                    <input
                      className={styles.input}
                      value={yAxis.min || ''}
                      placeholder={intl.formatMessage(messages.auto)}
                      onChange={(event: any) => {
                        const value = parseInt(event.target.value);
                        onClick({
                          ...yAxis,
                          min: isNaN(value) ? undefined : value,
                        });
                      }}
                    />
                  </div>
                </td>
              </tr>
            )}
            {showMax && (
              <tr>
                <td className={styles.checkBoxTD}></td>
                <td>
                  <div className={styles.inputSection}>
                    <div className={styles.inputLabel}>{intl.formatMessage(messages.max)}</div>
                    <input
                      className={styles.input}
                      value={yAxis.max || ''}
                      placeholder={intl.formatMessage(messages.auto)}
                      onChange={(event: any) => {
                        const value = parseInt(event.target.value);
                        onClick({
                          ...yAxis,
                          max: isNaN(value) ? undefined : value,
                        });
                      }}
                    />
                  </div>
                </td>
              </tr>
            )}
            {!yAxis.logarithmic && (
              <tr>
                <td className={styles.checkBoxTD}></td>
                <td>
                  <div className={styles.inputSection}>
                    <div className={styles.inputLabel}>{intl.formatMessage(messages.interval)}</div>
                    <input
                      className={styles.input}
                      value={yAxis.intervalJumps || ''}
                      placeholder={intl.formatMessage(messages.auto)}
                      onChange={(event: any) => {
                        const value = parseInt(event.target.value);
                        onClick({
                          ...yAxis,
                          intervalJumps: isNaN(value) ? undefined : value,
                          isIntervalEnabled: !isNaN(value),
                        });
                      }}
                    />
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

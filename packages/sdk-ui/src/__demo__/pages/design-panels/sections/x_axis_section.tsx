import styles from './x_axis_section.module.scss';
import { TogglerSection } from './toggler_section';
import classnames from 'classnames';
import { Checkbox } from '@/filters/components/common';
import { messages, useIntl } from './use-intl';
import { AxisLabel } from '@/types';

export const XAxisSection = ({
  xAxis,
  onClick,
}: {
  xAxis?: AxisLabel;
  onClick: (xAxis: AxisLabel) => void;
}) => {
  const intl = useIntl();
  return (
    <div>
      <TogglerSection
        label={intl.formatMessage(messages.xAxis)}
        checked={!!xAxis?.enabled}
        onClick={() => {
          onClick({
            ...xAxis,
            enabled: !xAxis?.enabled,
          });
        }}
      />
      {xAxis?.enabled && (
        <table className={styles.axisTable}>
          <tbody>
            <tr
              onClick={() =>
                onClick({
                  ...xAxis,
                  gridLines: !xAxis?.gridLines,
                })
              }
            >
              <td className={styles.checkBoxTD}>
                <div className={styles.center}>
                  <Checkbox checked={!!xAxis?.gridLines} />
                </div>
              </td>
              <td>
                <div className={styles.label}>{intl.formatMessage(messages.gridLines)}</div>
              </td>
            </tr>
            <tr
              onClick={() =>
                onClick({
                  ...xAxis,
                  labels: { enabled: !xAxis.labels?.enabled },
                })
              }
            >
              <td className={styles.checkBoxTD}>
                <div className={styles.center}>
                  <Checkbox checked={xAxis.labels?.enabled} />
                </div>
              </td>
              <td>
                <div className={styles.label}>{intl.formatMessage(messages.labels)}</div>
              </td>
            </tr>
            <TitleSection
              xAxis={xAxis}
              field={'title'}
              onClick={onClick}
              name={intl.formatMessage(messages.title)}
            />
            <TitleSection
              xAxis={xAxis}
              field={'x2Title'}
              onClick={onClick}
              name={intl.formatMessage(messages.x2Title)}
            />
          </tbody>
        </table>
      )}
    </div>
  );
};

const TitleSection = ({
  xAxis,
  field,
  onClick,
  name,
}: {
  xAxis: AxisLabel | undefined;
  field: 'title' | 'x2Title';
  onClick: (xAxis: AxisLabel) => void;
  name: string;
}) => {
  if (!xAxis) {
    return null;
  }
  return (
    <tr>
      <td className={styles.checkBoxTD}>
        <div className={styles.center}>
          <Checkbox
            checked={!!xAxis[field]?.enabled}
            onClick={() =>
              onClick({
                ...xAxis,
                [field]: { ...xAxis[field], enabled: !xAxis[field]?.enabled },
              })
            }
          />
        </div>
      </td>
      <td>
        <div className={styles.inputSection}>
          <div
            className={styles.inputLabel}
            onClick={() =>
              onClick({
                ...xAxis,
                [field]: { enabled: !xAxis[field]?.enabled, text: xAxis[field]?.text },
              })
            }
          >
            {name}
          </div>
          <input
            className={classnames(styles.input, {
              [styles.disabled]: !xAxis[field]?.enabled,
            })}
            value={xAxis[field]?.text ?? ''}
            onFocus={() => {
              if (!xAxis[field]?.enabled) {
                onClick({
                  ...xAxis,
                  [field]: { enabled: true, text: xAxis[field]?.text },
                });
              }
            }}
            onChange={(event: any) => {
              onClick({
                ...xAxis,
                [field]: { enabled: true, text: event.target.value },
              });
            }}
          />
        </div>
      </td>
    </tr>
  );
};

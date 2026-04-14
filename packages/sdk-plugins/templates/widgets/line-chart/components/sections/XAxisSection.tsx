import { ChangeEvent } from 'react';

import { AxisLabel } from '@sisense/sdk-ui';
import classnames from 'classnames';

import { Checkbox } from '../shared/Checkbox';
import { TogglerSection } from '../shared/TogglerSection';
import { messages, useIntl } from '../shared/use-intl';
import styles from './XAxisSection.module.scss';

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
            <tr>
              <td className={styles.checkBoxTD}>
                <div className={styles.center}>
                  <Checkbox
                    id="x-axis-grid-lines"
                    checked={!!xAxis?.gridLines}
                    onChange={() => onClick({ ...xAxis, gridLines: !xAxis?.gridLines })}
                  />
                </div>
              </td>
              <td>
                <label htmlFor="x-axis-grid-lines" className={styles.label}>
                  {intl.formatMessage(messages.gridLines)}
                </label>
              </td>
            </tr>
            <tr>
              <td className={styles.checkBoxTD}>
                <div className={styles.center}>
                  <Checkbox
                    id="x-axis-labels"
                    checked={!!xAxis.labels?.enabled}
                    onChange={() =>
                      onClick({
                        ...xAxis,
                        labels: { ...xAxis.labels, enabled: !xAxis.labels?.enabled },
                      })
                    }
                  />
                </div>
              </td>
              <td>
                <label htmlFor="x-axis-labels" className={styles.label}>
                  {intl.formatMessage(messages.labels)}
                </label>
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

/* eslint-disable security/detect-object-injection */
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
            onChange={() =>
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
          <button
            type="button"
            className={styles.inputLabel}
            onClick={() =>
              onClick({
                ...xAxis,
                [field]: { ...xAxis[field], enabled: !xAxis[field]?.enabled },
              })
            }
          >
            {name}
          </button>
          <input
            className={classnames(styles.input, {
              [styles.disabled]: !xAxis[field]?.enabled,
            })}
            value={xAxis[field]?.text ?? ''}
            onFocus={() => {
              if (!xAxis[field]?.enabled) {
                onClick({
                  ...xAxis,
                  [field]: { ...xAxis[field], enabled: true },
                });
              }
            }}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              onClick({
                ...xAxis,
                [field]: { ...xAxis[field], enabled: true, text: event.target.value },
              });
            }}
          />
        </div>
      </td>
    </tr>
  );
};
/* eslint-enable security/detect-object-injection */

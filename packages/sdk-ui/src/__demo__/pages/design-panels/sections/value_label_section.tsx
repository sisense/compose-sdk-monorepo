import styles from './value_label_section.module.scss';
import classnames from 'classnames';
import { capitalize } from 'lodash';
import { TogglerSection } from './toggler_section';
import { SeriesLabels } from '@/types';
import { getRotationType } from '@/chart-options-processor/translations/value-label-section';

const getSeriesLabels = (valueLabel: string): number => {
  let rotation = 0;
  switch (valueLabel) {
    case 'diagonal':
      rotation = -45;
      break;
    case 'horizontal':
      rotation = 0;
      break;
    case 'vertical':
      rotation = -90;
      break;
  }
  return rotation;
};

export const ValueLabelSection = ({
  onClick,
  valueLabel,
}: {
  valueLabel?: SeriesLabels;
  onClick: (valueLabel: SeriesLabels) => void;
}) => {
  const config = ['horizontal', 'diagonal', 'vertical'];
  const rotation = getRotationType(valueLabel?.rotation || 0);
  return (
    <div className={styles.valueLabelSection}>
      <TogglerSection
        label="Value Labels"
        checked={!!valueLabel?.enabled}
        onClick={() => {
          if (valueLabel?.enabled) {
            onClick({ ...valueLabel, enabled: false });
          } else {
            onClick({ ...valueLabel, enabled: true });
          }
        }}
      />
      {valueLabel?.enabled && (
        <table className={styles.valueLabelsTable}>
          <tbody>
            <tr className={styles.iconTr}>
              {config.map((alignment) => {
                return (
                  <td
                    key={alignment}
                    className={classnames('', {
                      [styles.hoverEffect]: rotation !== alignment,
                      [styles.tdSelected]: rotation === alignment,
                    })}
                    onClick={() => {
                      onClick({ ...valueLabel, rotation: getSeriesLabels(alignment) });
                    }}
                  >
                    <div className={styles.center}>
                      <div
                        className={classnames(styles[alignment], {
                          [styles.selected]: rotation === alignment,
                        })}
                      >
                        {'abc'}
                      </div>
                    </div>
                  </td>
                );
              })}
            </tr>
            <tr className={styles.textTr}>
              <td colSpan={3}>
                <div className={styles.center}>{capitalize(rotation)}</div>
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

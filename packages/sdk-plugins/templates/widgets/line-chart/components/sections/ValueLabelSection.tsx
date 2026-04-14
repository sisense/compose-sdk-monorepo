import { SeriesLabels } from '@sisense/sdk-ui';
import classnames from 'classnames';
import capitalize from 'lodash/capitalize';

import { TogglerSection } from '../shared/TogglerSection';
import { getRotationType } from '../shared/translation-utils';
import styles from './ValueLabelSection.module.scss';

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
        <div className={styles.valueLabelsContainer}>
          <div className={styles.iconRow}>
            {config.map((alignment) => (
              <button
                key={alignment}
                type="button"
                aria-pressed={rotation === alignment}
                aria-label={capitalize(alignment)}
                className={classnames(styles.alignmentOption, {
                  [styles.hoverEffect]: rotation !== alignment,
                  [styles.tdSelected]: rotation === alignment,
                })}
                onClick={() => onClick({ ...valueLabel, rotation: getSeriesLabels(alignment) })}
              >
                <div className={styles.center}>
                  <div
                    // eslint-disable-next-line security/detect-object-injection
                    className={classnames(styles[alignment], {
                      [styles.selected]: rotation === alignment,
                    })}
                  >
                    {'abc'}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className={styles.textRow}>
            <div className={styles.center}>{capitalize(rotation)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

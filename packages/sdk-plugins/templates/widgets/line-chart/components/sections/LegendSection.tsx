import { LegendOptions } from '@sisense/sdk-ui';
import capitalize from 'lodash/capitalize';

import { Radio } from '../shared/Radio';
import { TogglerSection } from '../shared/TogglerSection';
import styles from './LegendSection.module.scss';

const ALIGN_OPTIONS: NonNullable<LegendOptions['align']>[] = ['left', 'center', 'right'];
const VERTICAL_ALIGN_OPTIONS: NonNullable<LegendOptions['verticalAlign']>[] = [
  'top',
  'middle',
  'bottom',
];

export const LegendSection = ({
  onClick,
  legend,
}: {
  onClick: (legend: LegendOptions) => void;
  legend?: LegendOptions;
}) => {
  return (
    <div>
      <TogglerSection
        label="Legend"
        checked={!!legend?.enabled}
        onClick={() => onClick({ ...legend, enabled: !legend?.enabled })}
      />
      {legend?.enabled && (
        <div className={styles.options}>
          <div className={styles.group}>
            <div className={styles.groupLabel}>Align</div>
            {ALIGN_OPTIONS.map((align) => (
              <div key={align} className={styles.radio}>
                <Radio
                  label={capitalize(align)}
                  checked={legend.align === align}
                  onChange={() => onClick({ ...legend, align })}
                />
              </div>
            ))}
          </div>
          <div className={styles.group}>
            <div className={styles.groupLabel}>Vertical align</div>
            {VERTICAL_ALIGN_OPTIONS.map((verticalAlign) => (
              <div key={verticalAlign} className={styles.radio}>
                <Radio
                  label={capitalize(verticalAlign)}
                  checked={legend.verticalAlign === verticalAlign}
                  onChange={() => onClick({ ...legend, verticalAlign })}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

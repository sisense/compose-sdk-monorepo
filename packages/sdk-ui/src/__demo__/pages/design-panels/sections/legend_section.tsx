import styles from './legend_section.module.scss';
import { TogglerSection } from './toggler_section';
import { capitalize } from 'lodash';
import { Legend, LegendPosition } from '@/types';
import { Radio } from '@/filters/components/common';

export const LegendSection = ({
  onClick,
  legend,
}: {
  onClick: (legend: Legend) => void;
  legend?: Legend;
}) => {
  const config = ['top', 'left', 'right', 'bottom'];
  return (
    <div>
      <TogglerSection
        label="Legend"
        checked={!!legend?.enabled}
        onClick={() => {
          if (legend?.enabled) {
            onClick({ ...legend, enabled: false });
          } else {
            onClick({ ...legend, enabled: true });
          }
        }}
      />
      {legend?.enabled && (
        <div className={styles.legendTable}>
          {config.map((pos) => {
            return (
              <div
                key={pos}
                className={styles.radio}
                onClick={() => {
                  onClick({ ...legend, position: pos as LegendPosition });
                }}
              >
                <Radio
                  label={capitalize(pos)}
                  checked={legend.position === pos}
                  onClick={() => {
                    onClick({ ...legend, position: pos as LegendPosition });
                  }}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

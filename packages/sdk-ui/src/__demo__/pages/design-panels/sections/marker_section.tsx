import styles from './marker_section.module.scss';
import classnames from 'classnames';
import { TogglerSection } from './toggler_section';
import { capitalize } from 'lodash';
import { Markers } from '@/types';

export const MarkerSection = ({
  marker,
  onClick,
}: {
  marker?: Markers;
  onClick: (marker: Markers) => void;
}) => {
  return (
    <div>
      <TogglerSection
        label="Markers"
        checked={!!marker?.enabled}
        onClick={() => {
          onClick({
            enabled: !marker?.enabled,
            size: marker?.size,
            fill: marker?.fill,
          });
        }}
      />
      {marker?.enabled && (
        <div className={styles.component}>
          <table className={classnames(styles.markerTable, styles.table1)}>
            <tbody>
              <tr className={styles.iconTr}>
                <td
                  className={classnames('', {
                    [styles.hoverEffect]: marker.fill !== 'filled',
                  })}
                  onClick={() => {
                    onClick({ enabled: true, size: marker.size, fill: 'filled' });
                  }}
                >
                  <div className={styles.center}>
                    <div
                      className={classnames(styles.fullIcon, {
                        [styles.selected]: marker.fill === 'filled',
                        [styles.small]: marker.size === 'small' || !marker?.size,
                        [styles.large]: marker?.size === 'large',
                      })}
                    />
                  </div>
                </td>
                <td
                  className={classnames('', {
                    [styles.hoverEffect]: marker.fill !== 'hollow',
                  })}
                  onClick={() => {
                    onClick({
                      enabled: true,
                      size: marker.size,
                      fill: 'hollow',
                    });
                  }}
                >
                  <div className={styles.center}>
                    <div
                      className={classnames(styles.hollowIcon, {
                        [styles.selected]: marker.fill === 'hollow',
                        [styles.small]: marker.size === 'small' || !marker?.size,
                        [styles.large]: marker.size === 'large',
                      })}
                    />
                  </div>
                </td>
              </tr>
              <tr className={styles.textTr}>
                <td colSpan={2}>
                  <div className={styles.center}>{capitalize(marker.fill)}</div>
                </td>
              </tr>
            </tbody>
          </table>
          <table className={styles.markerTable}>
            <tbody>
              <tr className={styles.iconTr}>
                <td
                  className={classnames('', {
                    [styles.hoverEffect]: marker.size !== 'small',
                  })}
                  onClick={() => {
                    onClick({
                      enabled: true,
                      size: 'small',
                      fill: marker.fill,
                    });
                  }}
                >
                  <div className={styles.center}>
                    <div
                      className={classnames(styles.smallIcon, {
                        [styles.selected]: marker.size === 'small',
                      })}
                    >
                      {'S'}
                    </div>
                  </div>
                </td>
                <td
                  className={classnames('', {
                    [styles.hoverEffect]: marker.size !== 'large',
                  })}
                  onClick={() => {
                    onClick({
                      enabled: true,
                      size: 'large',
                      fill: marker.fill,
                    });
                  }}
                >
                  <div className={styles.center}>
                    <div
                      className={classnames(styles.largeIcon, {
                        [styles.selected]: marker.size === 'large',
                      })}
                    >
                      {'L'}
                    </div>
                  </div>
                </td>
              </tr>
              <tr className={styles.textTr}>
                <td colSpan={2}>
                  <div className={styles.center}>{capitalize(marker.size)}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

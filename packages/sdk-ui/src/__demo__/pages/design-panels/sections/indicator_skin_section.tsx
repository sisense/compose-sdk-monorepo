import styles from './indicator_skin_section.module.scss';
import classnames from 'classnames';
import { capitalize } from 'lodash';
import { messages, useIntl } from './use-intl';
import {
  IndicatorSkin,
  IndicatorStyleType,
} from '@/chart-options-processor/translations/design-options';

export const IndicatorSkinSection = ({
  indicatorType,
  indicatorSkin,
  onClick,
}: {
  indicatorType: IndicatorStyleType;
  indicatorSkin: IndicatorSkin;
  onClick: (indicatorSkin: IndicatorSkin) => void;
}) => {
  const intl = useIntl();
  const skin1 = indicatorType === 'gauge' ? 1 : 'vertical';
  const skin2 = indicatorType === 'gauge' ? 2 : 'horizontal';
  return (
    <div>
      <div className={styles.title}>{intl.formatMessage(messages.skin)}</div>
      <table className={styles.table}>
        <tbody>
          <tr>
            <td
              className={styles.hoverEffect}
              onClick={() => {
                onClick(skin1);
              }}
            >
              <div className={styles.center}>
                {indicatorType !== 'gauge' && (
                  <div
                    className={classnames(styles.verticalIcon, {
                      [styles.selected]: indicatorSkin === 'vertical',
                    })}
                  >
                    {'45'}
                  </div>
                )}
                <div className={styles.skin1Text}>{capitalize(skin1.toString())}</div>
              </div>
            </td>
            <td
              className={styles.hoverEffect}
              onClick={() => {
                onClick(skin2);
              }}
            >
              <div className={styles.center}>
                {indicatorType !== 'gauge' && (
                  <div
                    className={classnames(styles.horizontalIcon, {
                      [styles.selected]: indicatorSkin === 'horizontal',
                    })}
                  >
                    <div className={styles.horizontal}>{'45'}</div>
                    <div className={styles.horizontalSpan} />
                  </div>
                )}
                <div className={styles.skin2Text}>{capitalize(skin2.toString())}</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

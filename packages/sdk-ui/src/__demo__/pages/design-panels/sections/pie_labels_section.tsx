import styles from './pie_labels_section.module.scss';
import { TogglerSection } from './toggler_section';
import classnames from 'classnames';
import { PieLabels } from '@/chart-options-processor/translations/pie-plot-options';
import { useIntl, messages } from './use-intl';
import { Checkbox } from '@/filters/components/common';

export const PieLabelsSection = ({
  pieLabels,
  onClick,
}: {
  pieLabels: PieLabels;
  onClick: (labels: PieLabels) => void;
}) => {
  const intl = useIntl();
  return (
    <div>
      <TogglerSection
        label="Labels"
        checked={pieLabels.enabled}
        onClick={() => {
          onClick({
            ...pieLabels,
            enabled: !pieLabels.enabled,
          });
        }}
      />
      {pieLabels.enabled && (
        <table className={styles.table}>
          <tbody>
            <tr
              onClick={() =>
                onClick({
                  ...pieLabels,
                  showCategories: !pieLabels.showCategories,
                })
              }
            >
              <td className={styles.checkBoxTD}>
                <div className={styles.center}>
                  <Checkbox checked={pieLabels.showCategories} />
                </div>
              </td>
              <td>
                <div className={styles.label}>{intl.formatMessage(messages.categories)}</div>
              </td>
            </tr>
            <tr
              onClick={() =>
                onClick({
                  ...pieLabels,
                  showValue: !pieLabels.showValue,
                })
              }
            >
              <td className={styles.checkBoxTD}>
                <div className={styles.center}>
                  <Checkbox checked={pieLabels.showValue} />
                </div>
              </td>
              <td>
                <div className={styles.label}>{intl.formatMessage(messages.value)}</div>
              </td>
            </tr>
            <tr
              onClick={() =>
                onClick({
                  ...pieLabels,
                  showPercent: !pieLabels.showPercent,
                })
              }
            >
              <td className={styles.checkBoxTD}>
                <div className={styles.center}>
                  <Checkbox checked={pieLabels.showPercent} />
                </div>
              </td>
              <td>
                <div className={styles.label}>{intl.formatMessage(messages.percent)}</div>
              </td>
            </tr>
            <tr
              onClick={() => {
                if (!pieLabels.showPercent) {
                  return;
                }

                onClick({
                  ...pieLabels,
                  showDecimals: !pieLabels.showDecimals,
                });
              }}
              className={classnames({
                [styles.disabled]: !pieLabels.showPercent,
              })}
            >
              <td className={styles.checkBoxTD}>
                <div className={styles.center}>
                  <Checkbox checked={pieLabels.showDecimals} />
                </div>
              </td>
              <td>
                <div className={styles.label}>{intl.formatMessage(messages.decimals)}</div>
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

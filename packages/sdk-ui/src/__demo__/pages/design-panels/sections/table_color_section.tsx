import { Checkbox } from '@/filters/components/common';
import styles from './table_color_section.module.scss';
import { useIntl, messages } from './use-intl';

export const TableColorSection = ({
  headersColor,
  alternatingColumnsColor,
  alternatingRowsColor,
  onClick,
}: {
  headersColor: boolean;
  alternatingColumnsColor: boolean;
  alternatingRowsColor: boolean;
  onClick: (
    headersColor: boolean,
    alternatingColumnsColor: boolean,
    alternatingRowsColor: boolean,
  ) => void;
}) => {
  const intl = useIntl();
  return (
    <div>
      <div className={styles.title}>{intl.formatMessage(messages.colors)}</div>
      <table className={styles.table}>
        <tbody>
          <tr
            onClick={() => {
              onClick(!headersColor, alternatingColumnsColor, alternatingRowsColor);
            }}
          >
            <td className={styles.checkBoxTD}>
              <div className={styles.center}>
                <Checkbox checked={headersColor} />
              </div>
            </td>
            <td>
              <div className={styles.label}>{intl.formatMessage(messages.headers)}</div>
            </td>
          </tr>
          <tr
            onClick={() => {
              onClick(headersColor, alternatingColumnsColor, !alternatingRowsColor);
            }}
          >
            <td className={styles.checkBoxTD}>
              <div className={styles.center}>
                <Checkbox checked={alternatingRowsColor} />
              </div>
            </td>
            <td>
              <div className={styles.label}>{intl.formatMessage(messages.alternatingRows)}</div>
            </td>
          </tr>
          <tr
            onClick={() => {
              onClick(headersColor, !alternatingColumnsColor, alternatingRowsColor);
            }}
          >
            <td className={styles.checkBoxTD}>
              <div className={styles.center}>
                <Checkbox checked={alternatingColumnsColor} />
              </div>
            </td>
            <td>
              <div className={styles.label}>{intl.formatMessage(messages.alternatingColumns)}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

import classnames from 'classnames';

import styles from './LineWidthSection.module.scss';

export const LineWidthSection = ({
  lineWidth,
  onClick,
}: {
  lineWidth?: number;
  onClick: (lineWidth: number) => void;
}) => {
  const config = [
    { displayName: 'Thin', width: 1 },
    { displayName: 'Bold', width: 3 },
    { displayName: 'Thick', width: 5 },
  ];
  return (
    <div>
      <div className={styles.title}>{'Line Width'}</div>
      <table className={styles.lineWidthTable}>
        <tbody>
          {config.map(({ displayName, width }) => {
            return (
              <tr
                key={displayName}
                className={classnames('', {
                  [styles.hoverEffect]: lineWidth !== width,
                  [styles.selected]: lineWidth === width,
                })}
                onClick={() => {
                  onClick(width);
                }}
              >
                <td className={styles.lineLabel}>{displayName}</td>
                <td>
                  <div
                    style={{ borderBottomWidth: width }}
                    className={classnames(styles.line, {
                      [styles.selected]: lineWidth === width,
                    })}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

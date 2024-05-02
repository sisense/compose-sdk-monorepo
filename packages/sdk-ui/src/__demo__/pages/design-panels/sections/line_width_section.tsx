import { LineWidth } from '@/types';
import styles from './line_width_section.module.scss';
import classnames from 'classnames';

export const LineWidthSection = ({
  lineWidth,
  onClick,
}: {
  lineWidth?: LineWidth;
  onClick: (lineWidth: LineWidth) => void;
}) => {
  const config = [
    { displayName: 'Thin', width: 'thin' },
    { displayName: 'Bold', width: 'bold' },
    { displayName: 'Thick', width: 'thick' },
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
                  [styles.hoverEffect]: lineWidth?.width !== width,
                })}
                onClick={() => {
                  onClick({ width: width } as LineWidth);
                }}
              >
                <td>{displayName}</td>
                <td>
                  <div
                    style={{ borderBottomWidth: width }}
                    className={classnames(styles.line, {
                      [styles.selected]: lineWidth?.width === width,
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

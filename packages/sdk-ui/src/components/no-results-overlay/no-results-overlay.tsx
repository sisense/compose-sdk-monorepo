import styles from './no-results-overlay.module.scss';
import { useEffect, useRef, useState } from 'react';
import { useThemeContext } from '../theme-provider';
import { ChartType, TableType } from '../../types';
import { noResultOverlayImages } from './images';
import { translation } from '../../locales/en';

/**
 * This component displays `No Results` overlay for visualization (e.g., Chart, Table) with no data
 *
 * @param props - component properties
 * @param props.iconType - icon type related to chart or table
 * @returns A NoResultsOverlay component with specific icon
 * @internal
 */
export const NoResultsOverlay = ({ iconType }: { iconType: ChartType | TableType }) => {
  const { themeSettings } = useThemeContext();
  const wrapper = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<{ width: number | null; height: number | null }>({
    width: null,
    height: null,
  });

  useEffect(() => {
    if (wrapper.current) {
      setSize({
        width: wrapper.current.offsetWidth,
        height: wrapper.current.offsetHeight,
      });
    }
  }, []);

  const icon = noResultOverlayImages[iconType];

  return (
    <div ref={wrapper} className={styles.wrapper}>
      <div
        className={styles.title}
        style={{
          fontFamily: themeSettings.typography?.fontFamily,
          fontSize: calculateTitleFontSize(size.width, size.height),
        }}
      >
        {translation.common.chartNoData}
      </div>
      {icon ? <img className={styles.image} src={icon} /> : null}
    </div>
  );
};

function calculateTitleFontSize(width: number | null, height: number | null): string {
  if (!width || !height) return '18px';

  if (width < 300) {
    // calc by diagonal
    return `${Math.max(Math.sqrt(width * width + height * height) * 0.045, 18)}px`;
  } else {
    // calc by height
    return `${Math.min(Math.max(height * 0.09, 18), 60)}px`;
  }
}

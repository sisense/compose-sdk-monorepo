import styles from './chart_placeholder_image.module.scss';
import { ChartType } from '@/types';

export const ChartPlaceholderImage = ({
  chartType,
  width,
  height,
}: {
  chartType: ChartType;
  width?: number;
  height?: number;
}) => {
  return <div style={{ height, width }} className={styles[chartType]}></div>;
};

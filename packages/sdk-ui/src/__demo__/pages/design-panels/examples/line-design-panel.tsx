import { useMemo } from 'react';
import styles from './design-options-panel.module.scss';
import { ValueStyle } from '@/chart-data-options/types';
import { AutoZoomSection } from '../sections/auto_zoom_section';
import { LegendSection } from '../sections/legend_section';
import { LineTypeSection } from '../sections/line_type_section';
import { LineWidthSection } from '../sections/line_width_section';
import { MarkerSection } from '../sections/marker_section';
import { ValueLabelSection } from '../sections/value_label_section';
import { XAxisSection } from '../sections/x_axis_section';
import { YAxisSection } from '../sections/y_axis_section';
import { CartesianChartDataOptions, LineStyleOptions } from '@/types';

export const LineDesignPanel = ({
  dataOptions,
  styleOptions,
  onChange,
}: {
  dataOptions: CartesianChartDataOptions;
  styleOptions: LineStyleOptions;
  onChange: (name: string, value: any) => void;
}) => {
  const hasY2Axis = useMemo(
    () => dataOptions.value.some((s) => (s as ValueStyle)?.showOnRightAxis),
    [dataOptions],
  );
  return (
    <div className={styles.component}>
      <LineTypeSection
        lineType={styleOptions.subtype}
        onClick={(value) => onChange('subtype', value)}
      />
      <LineWidthSection
        lineWidth={styleOptions.lineWidth}
        onClick={(value) => onChange('lineWidth', value)}
      />
      <LegendSection legend={styleOptions.legend} onClick={(value) => onChange('legend', value)} />
      <ValueLabelSection
        valueLabel={styleOptions.seriesLabels}
        onClick={(value) => onChange('seriesLabels', value)}
      />
      <MarkerSection
        marker={styleOptions.markers}
        onClick={(value) => onChange('markers', value)}
      />
      <XAxisSection xAxis={styleOptions.xAxis} onClick={(value) => onChange('xAxis', value)} />
      <YAxisSection
        yAxis={styleOptions.yAxis}
        onClick={(value) => onChange('yAxis', value)}
        sectionTitle={'Y-Axis'}
        hasRange={true}
        hasGridLine={false}
      />
      {hasY2Axis && (
        <YAxisSection
          yAxis={styleOptions.y2Axis}
          onClick={(value) => onChange('y2Axis', value)}
          sectionTitle={'Y2-Axis'}
          hasRange={true}
          hasGridLine={false}
        />
      )}
      <AutoZoomSection
        navigator={styleOptions.navigator}
        onClick={(value) => onChange('navigator', value)}
      />
    </div>
  );
};

import { StyleOptions } from '../../types';
import { AutoZoomSection } from './AutoZoomSection';
import styles from './DesignOptionsPanel.module.scss';
import { LegendSection } from './LegendSection';
import { LineTypeSection } from './LineTypeSection';
import { LineWidthSection } from './LineWidthSection';
import { MarkerSection } from './MarkerSection';
import { ValueLabelSection } from './ValueLabelSection';
import { XAxisSection } from './XAxisSection';
import { YAxisSection } from './YAxisSection';

export const LineDesignPanel = ({
  styleOptions,
  onChange,
}: {
  styleOptions: StyleOptions;
  onChange: <K extends keyof StyleOptions>(name: K, value: StyleOptions[K]) => void;
}) => {
  return (
    <div className={styles.component}>
      <LineTypeSection
        lineType={styleOptions.subtype}
        onClick={(value) => onChange('subtype', value)}
      />
      <LineWidthSection
        lineWidth={styleOptions.line?.width}
        onClick={(value) => onChange('line', { ...(styleOptions.line ?? {}), width: value })}
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
      <YAxisSection
        yAxis={styleOptions.y2Axis}
        onClick={(value) => onChange('y2Axis', value)}
        sectionTitle={'Y2-Axis'}
        hasRange={true}
        hasGridLine={false}
      />
      <AutoZoomSection
        navigator={styleOptions.navigator}
        onClick={(value) => onChange('navigator', value)}
      />
    </div>
  );
};

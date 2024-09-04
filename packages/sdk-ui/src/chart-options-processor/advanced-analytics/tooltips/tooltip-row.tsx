import React from 'react';
type AdvancedAnalyticsTooltipRowProps = {
  name: string;
  value: string[];
};

export default function AdvancedAnalyticsTooltipRow(props: AdvancedAnalyticsTooltipRowProps) {
  const { name, value } = props;
  return (
    <div style={{ display: 'table-row-group' }}>
      <div style={{ display: 'table-row', height: '18px' }}>
        <div
          style={{
            display: 'table-cell',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            wordWrap: 'normal',
            wordBreak: 'keep-all',
            whiteSpace: 'nowrap',
          }}
        >
          {name}
        </div>
        <div style={{ display: 'table-cell', paddingLeft: '15px', fontWeight: '600' }}>
          {value.map((v, i) => (
            <div key={i}>{v}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

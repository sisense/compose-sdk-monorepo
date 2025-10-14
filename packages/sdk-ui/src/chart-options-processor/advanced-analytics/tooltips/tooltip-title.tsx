import React from 'react';

type AdvancedAnalyticsTooltipTitleProps = {
  prefix: string;
  title: string;
};
export default function AdvancedAnalyticsTooltipTitle(props: AdvancedAnalyticsTooltipTitleProps) {
  const { prefix, title } = props;
  return (
    <div
      style={{
        display: 'flex',
        marginBottom: '5px',
      }}
    >
      <div
        style={{
          flexShrink: 0,
        }}
      >
        {prefix}
      </div>
      <div
        style={{
          marginLeft: '5px',
          fontWeight: 600,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          wordWrap: 'normal',
          wordBreak: 'keep-all',
          whiteSpace: 'nowrap',
        }}
      >
        {title}
      </div>
    </div>
  );
}

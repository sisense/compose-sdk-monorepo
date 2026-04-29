import React from 'react';

type AdvancedAnalyticsTooltipFooterProps = {
  x1Value?: string;
  x2Value?: string;
};
export default function AdvancedAnalyticsTooltipFooter(props: AdvancedAnalyticsTooltipFooterProps) {
  const { x1Value, x2Value } = props;
  return (
    <>
      <div
        style={{
          fontSize: '10px',
          color: '#666',
          marginTop: '6px',
        }}
      >
        {x2Value || x1Value ? <hr className="csdk-border-t" style={{ margin: '7px 0px' }} /> : ''}
      </div>
      {x2Value ? x2Value : ''}
      {x2Value && x1Value ? ', ' : ''}
      {x1Value ? x1Value : ''}
    </>
  );
}

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
      {x2Value && x1Value ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="18"
          viewBox="0 0 24 24"
          style={{ display: 'inline-block' }}
        >
          <path
            fill="#5B6372"
            fillRule="nonzero"
            d="M6.84 8.5l-2.72-3.175a.5.5 0 1 1 .76-.65l2.998 3.5a.5.5 0 0 1 0 .65l-2.998 3.5a.5.5 0 1 1-.76-.65l2.72-3.175z"
          />
        </svg>
      ) : (
        ''
      )}
      {x1Value ? x1Value : ''}
    </>
  );
}

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { useTranslation } from 'react-i18next';
import { TFunction } from '@sisense/sdk-common';
import AdvancedAnalyticsTooltipTitle from './tooltip-title.js';
import AdvancedAnalyticsTooltipRow from './tooltip-row.js';
import AdvancedAnalyticsTooltipFooter from './tooltip-footer.js';
import { DEFAULT_TEXT_COLOR } from '@/const';

type ForecastToolipProps = {
  x1Value?: string;
  x2Value?: string;
  title: string;
  forecastValue: string;
  upperValue: string;
  lowerValue: string;
  confidenceValue: string;
  translate?: TFunction;
};

export default function ForecastToolipComponent(props: ForecastToolipProps) {
  const { t } = useTranslation();
  const translate = props.translate || t;
  const { confidenceValue, lowerValue, forecastValue, upperValue, title, x1Value, x2Value } = props;

  return (
    <div
      style={{
        color: DEFAULT_TEXT_COLOR,
        fontSize: '13px',
        lineHeight: '18px',
        margin: '4px 6px',
      }}
    >
      <AdvancedAnalyticsTooltipTitle
        prefix={translate('advanced.tooltip.forecast')}
        title={title}
      />
      <div style={{ display: 'table' }}>
        <AdvancedAnalyticsTooltipRow
          name={translate('advanced.tooltip.forecastValue')}
          value={[forecastValue]}
        />
        <AdvancedAnalyticsTooltipRow
          name={translate('advanced.tooltip.max')}
          value={[upperValue]}
        />
        <AdvancedAnalyticsTooltipRow
          name={translate('advanced.tooltip.min')}
          value={[lowerValue]}
        />
        <AdvancedAnalyticsTooltipRow
          name={translate('advanced.tooltip.confidenceInterval')}
          value={[confidenceValue]}
        />
      </div>

      <AdvancedAnalyticsTooltipFooter x1Value={x1Value} x2Value={x2Value} />
    </div>
  );
}

export const renderForecastTooltipString = (props: ForecastToolipProps) =>
  ReactDOMServer.renderToString(<ForecastToolipComponent {...props} />);

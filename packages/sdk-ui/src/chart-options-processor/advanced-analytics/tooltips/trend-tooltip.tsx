import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { useTranslation } from 'react-i18next';
import { TFunction } from '@sisense/sdk-common';
import AdvancedAnalyticsTooltipTitle from './tooltip-title';
import AdvancedAnalyticsTooltipRow from './tooltip-row';
import AdvancedAnalyticsTooltipFooter from './tooltip-footer';
import { DEFAULT_TEXT_COLOR } from '@/const';

const TrendTypesFromExpression = {
  smooth: 'Advanced Smoothing',
  linear: 'Linear Trend',
  local: 'Local Estimates',
  logarithmic: 'Logarithmic Trend',
};

type TrendToolipProps = {
  x1Value?: string;
  x2Value?: string;
  modelType: keyof typeof TrendTypesFromExpression | string;
  title: string;
  trendData: {
    min: string;
    max: string;
    median: string;
    average: string;
  };
  localValue: string;
  translate?: TFunction;
};

export default function TrendToolip(props: TrendToolipProps) {
  const { t } = useTranslation();
  const translate = props.translate || t;
  const { localValue, trendData, modelType, title, x1Value, x2Value } = props;

  const trendDataFormatted = [
    `${translate('advanced.tooltip.trendData.min')} ${trendData.min}`,
    `${translate('advanced.tooltip.trendData.max')} ${trendData.max}`,
    `${translate('advanced.tooltip.trendData.median')} ${trendData.median}`,
    `${translate('advanced.tooltip.trendData.average')} ${trendData.average}`,
  ];
  return (
    <div
      style={{
        color: DEFAULT_TEXT_COLOR,
        fontSize: '13px',
        lineHeight: '18px',
        margin: '4px 6px',
      }}
    >
      <AdvancedAnalyticsTooltipTitle prefix={translate('advanced.tooltip.trend')} title={title} />
      <div style={{ display: 'table' }}>
        <AdvancedAnalyticsTooltipRow
          name={translate('advanced.tooltip.trendType')}
          value={[TrendTypesFromExpression[modelType]]}
        />
        <AdvancedAnalyticsTooltipRow
          name={translate('advanced.tooltip.trendLocalValue')}
          value={[localValue]}
        />
        <AdvancedAnalyticsTooltipRow
          name={translate('advanced.tooltip.trendDataKey')}
          value={trendDataFormatted}
        />
      </div>
      <AdvancedAnalyticsTooltipFooter x1Value={x1Value} x2Value={x2Value} />
    </div>
  );
}

export const renderTrendTooltipString = (props: TrendToolipProps) =>
  ReactDOMServer.renderToString(<TrendToolip {...props} />);

/* eslint-disable max-lines-per-function */
import { CategoricalChartDataOptionsInternal } from '../../../chart-data-options/types';
import { TreemapChartDesignOptions } from '../design-options';
import { InternalSeriesNode, TooltipSettings } from '../../tooltip';
import { colorChineseSilver, colorWhite } from '../../chart-options-service';
import { applyFormat, defaultConfig } from '../number-format-config';
import { TooltipFormatterContextObject } from '@sisense/sisense-charts';

export const getTreemapTooltipSettings = (
  chartDataOptions: CategoricalChartDataOptionsInternal,
  designOptions: TreemapChartDesignOptions,
): TooltipSettings => ({
  animation: false,
  backgroundColor: colorWhite,
  borderColor: colorChineseSilver,
  borderRadius: 10,
  borderWidth: 1,
  useHTML: true,
  outside: true,
  formatter: function (this) {
    return treemapTooltipFormatter(this, chartDataOptions, designOptions);
  },
});

function getContribution(value: number, total: number) {
  return value / (total / 100);
}

function getFormattedContribution(value: number, total: number) {
  return `${getContribution(value, total).toPrecision(3)}%`;
}

export function treemapTooltipFormatter(
  context: TooltipFormatterContextObject,
  chartDataOptions: CategoricalChartDataOptionsInternal,
  designOptions: TreemapChartDesignOptions,
) {
  const numberFormatConfig = chartDataOptions.y?.[0]?.numberFormatConfig ?? defaultConfig;
  const isContributionMode = designOptions?.tooltip?.mode === 'contribution';
  const valueTitle = chartDataOptions.y?.[0]?.title ?? chartDataOptions.y?.[0]?.name;
  const color = context.color as string;

  let rootValue = 0;
  const nodesToShow: InternalSeriesNode[] = [];
  const handleNode = (node: InternalSeriesNode) => {
    if (node.parentNode) {
      nodesToShow.push(node);
    } else {
      rootValue = node.val;
      return;
    }
    handleNode(node.parentNode);
  };
  // eslint-disable-next-line
  handleNode(context.point['node'] as InternalSeriesNode);

  return `
      <div
        style="minWidth: 100px; color: #acacac; fontSize: 13px; lineHeight: 20px; background: white">
        ${[...nodesToShow]
          .reverse()
          .map(
            (node) => `
          <div style="display: flex; justify-content: space-between;">
            <span>${node.name}</span>
            <span>${
              isContributionMode
                ? getFormattedContribution(node.val, rootValue)
                : applyFormat(numberFormatConfig, node.val)
            }</span>
          </div>
          <hr style="margin: 5px 0px" />
        `,
          )
          .join('')}
        <div>
          <span style="color:${color}">${
    isContributionMode
      ? getFormattedContribution(nodesToShow[0].val, rootValue)
      : applyFormat(numberFormatConfig, nodesToShow[0]?.val)
  }</span> of ${valueTitle}
        </div>
        <div>
          ${
            nodesToShow[1]
              ? `<span style="color:${color}">${getFormattedContribution(
                  nodesToShow[0]?.val,
                  nodesToShow[1]?.val,
                )}%</span> of ${nodesToShow[1]?.name}`
              : ''
          }
        </div>
      </div>`;
}

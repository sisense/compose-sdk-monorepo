import { CategoricalChartDataOptionsInternal } from '../../../chart-data-options/types';
import { TreemapChartDesignOptions } from '../design-options';
import {
  HighchartsDataPointContext,
  HighchartsDataPointContextNode,
  TooltipSettings,
} from '../tooltip-utils';
import { colorChineseSilver, colorWhite } from '../../../chart-data-options/coloring/consts';
import { applyFormat, getCompleteNumberFormatConfig } from '../number-format-config';
import './treemap-tooltip.scss';
import { getDataOptionTitle } from '@/chart-data-options/utils';
import { TFunction } from '@sisense/sdk-common';

type TooltipFormatterOptions = {
  displayTotalContribution: boolean;
  displayColorCircles: boolean;
  shouldSkip: (context: HighchartsDataPointContext) => boolean;
};

export const getTreemapTooltipSettings = (
  chartDataOptions: CategoricalChartDataOptionsInternal,
  designOptions: TreemapChartDesignOptions,
  translate: TFunction,
  formatterOptions?: TooltipFormatterOptions,
): TooltipSettings => ({
  animation: false,
  backgroundColor: colorWhite,
  borderColor: colorChineseSilver,
  borderRadius: 10,
  borderWidth: 1,
  padding: 1,
  useHTML: true,
  outside: true,
  formatter: function (this) {
    return treemapTooltipFormatter(
      this,
      chartDataOptions,
      designOptions,
      translate,
      formatterOptions,
    );
  },
});

const triangle = `
  <div style="position: absolute; top: 100%; right: 40px; z-index: 1">
    <div style="
      border: solid transparent;
      content: ' ';
      height: 0;
      width: 0;
      position: absolute;
      pointer-events: none;
      border-color: rgba(136,136,136,0);
      border-top-color: #ccc;
      border-width: 7px 12px 12px 12px;
      margin-left: -7px;
    "></div>
     <div style="
       border: solid transparent;
       content: ' ';
       height: 0;
       width: 0;
       position: absolute;
       pointer-events: none;
       border-color: rgba(255,255,255,0);
       border-top-color: #fff;
       border-width: 6px 11px 11px 11px;
       margin-left: -6px;
     "></div>
  </div>
`;

function getContribution(value: number, total: number) {
  return value / (total / 100);
}

function getFormattedContribution(value: number, total: number) {
  return `${getContribution(value, total).toPrecision(3)}%`;
}

export function treemapTooltipFormatter(
  context: HighchartsDataPointContext,
  chartDataOptions: CategoricalChartDataOptionsInternal,
  designOptions: TreemapChartDesignOptions,
  translate: TFunction,
  formatterOptions?: TooltipFormatterOptions,
) {
  if (formatterOptions?.shouldSkip && formatterOptions.shouldSkip(context)) {
    return false;
  }

  const isYEmpty = chartDataOptions.y?.length === 0;
  const numberFormatConfig = getCompleteNumberFormatConfig(
    chartDataOptions.y?.[0]?.numberFormatConfig,
  );
  const isContributionMode = designOptions?.tooltip?.mode === 'contribution';
  const valueTitle = getDataOptionTitle(chartDataOptions.y?.[0]);
  const color = context.color as string;

  let rootValue = 0;
  const nodesToShow: HighchartsDataPointContextNode[] = [];
  const handleNode = (node: HighchartsDataPointContextNode) => {
    if (node.parentNode) {
      nodesToShow.push(node);
    } else {
      rootValue = node.val;
      return;
    }
    handleNode(node.parentNode);
  };
  // eslint-disable-next-line
  handleNode(context.point['node'] as HighchartsDataPointContextNode);

  return `
      <div
        class="csdk-treemap-tooltip-wrapper"
        style="padding-bottom: ${isYEmpty ? '0' : '10px'};"
        >
        ${[...nodesToShow]
          .reverse()
          .map((node, index) => {
            const isLastNode = index === nodesToShow.length - 1;
            return `
                <div
                  class="csdk-treemap-tooltip-level"
                  style="background: ${isLastNode ? '#f2f2f2' : 'white'};"
                  >
                  ${
                    formatterOptions?.displayColorCircles
                      ? prepareTooltipColorCircle(node.color as string)
                      : ''
                  }
                  <span
                    style="color: ${isLastNode ? color : 'currentColor'}"
                  >${node.name}</span>
                  <span
                    style="color: ${isLastNode ? '#5B6372' : 'currentColor'}; margin-left: auto;"
                  >${
                    isContributionMode
                      ? getFormattedContribution(node.val, rootValue)
                      : applyFormat(numberFormatConfig, node.val)
                  }</span>
                  ${isLastNode ? '' : triangle}
                </div>`;
          })
          .join('')}
        ${
          isYEmpty
            ? ''
            : `<div class="csdk-treemap-tooltip-value">
          <span style="color:${color}; font-size: 15px">${
                isContributionMode
                  ? getFormattedContribution(nodesToShow[0].val, rootValue)
                  : applyFormat(numberFormatConfig, nodesToShow[0]?.val)
              }</span> ${translate('treemap.tooltip.of')} ${valueTitle}
        </div>`
        }
        ${
          nodesToShow[1]
            ? `<div class="csdk-treemap-tooltip-value" style="padding-top: 4px;">
                  <span style="color:${color}; font-size: 15px">${getFormattedContribution(
                nodesToShow[0]?.val,
                nodesToShow[1]?.val,
              )}
                  </span> ${translate('treemap.tooltip.of')} ${nodesToShow[1]?.name}
                </div>`
            : ''
        }
        ${
          formatterOptions?.displayTotalContribution && !isContributionMode
            ? `<div class="csdk-treemap-tooltip-value" style="padding-top: 4px;">
                    <span style="color:${color}; font-size: 15px">${getFormattedContribution(
                nodesToShow[0]?.val,
                rootValue,
              )}
                    </span> ${translate('treemap.tooltip.ofTotal')}
                   </div>`
            : ''
        }
        </div>
      </div>`;
}

function prepareTooltipColorCircle(color: string) {
  return `
    <div style="
      width: 12px;
      height: 12px;
      border-radius: 100%;
      background-color: ${color};
      margin-right: 6px;
    "></div>
  `;
}

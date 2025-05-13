import { ScattermapChartLocation } from '@/chart-data/types';
import { ScattermapChartDataOptionsInternal } from '@/chart-data-options/types.js';
import { getDataOptionTitle, isMeasureColumn } from '@/chart-data-options/utils.js';
import { formatTooltipValue } from '@/chart-options-processor/translations/tooltip-utils.js';

export const enum TooltipShowDetails {
  YES,
  NO,
  LOADING,
}

const TOOLTIP_NO_VALUE = `N/A`;
const TOOLTIP_DETAILS_ITEMS_LIMIT = 10;

// todo: reuse common loading indicator from `loading-indicator.tsx`
const loadingIconSvg = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="green"
    class="csdk-animate-spin"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
      fill="transparent"
      fillOpacity="0.3"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M20 12C20 16.4183 16.4183 20 12 20C11.2844 20 10.5908 19.906 9.93078 19.7298C9.96227 19.5889 9.97888 19.4423 9.97888 19.2918C9.97888 18.1873 9.08345 17.2918 7.97888 17.2918C6.87431 17.2918 5.97888 18.1873 5.97888 19.2918C5.97888 20.3964 6.87431 21.2918 7.97888 21.2918C8.56576 21.2918 9.0936 21.0391 9.45946 20.6364C10.2652 20.8731 11.1178 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3V4C16.4183 4 20 7.58172 20 12Z"
      fill="#22C3C3"
    />
  </svg>
`;

const spanSegment = (value: string) => {
  return `<span class="csdk-scattermap-tooltip-label">${value}</span>`;
};

const prepareTooltipDetailsListContent = (detailsItems: string[]) => {
  const limitExcededContent = `
    <div>
      <div>${spanSegment('...')}</div>
      <div>${spanSegment(`Showing first ${TOOLTIP_DETAILS_ITEMS_LIMIT} results`)}</div>
    </div>
  `;
  return `
    <div>
      ${detailsItems
        .slice(0, TOOLTIP_DETAILS_ITEMS_LIMIT)
        .map((item) => `<div>${spanSegment(item)}</div>`)
        .join('')}
      ${detailsItems.length > TOOLTIP_DETAILS_ITEMS_LIMIT ? limitExcededContent : ''}
    </div>
  `;
};

const formatCategoryHtml = (category: string) => {
  return `
    <span class="csdk-scattermap-tooltip-category">
      ${spanSegment(category)}
    </span>
  `;
};

const formatLoaderIndicatorHtml = () => {
  return spanSegment(loadingIconSvg);
};

// eslint-disable-next-line max-lines-per-function
export const createScattermapTooltip = (
  location: ScattermapChartLocation,
  dataOptions: ScattermapChartDataOptionsInternal,
  showDetails: TooltipShowDetails = TooltipShowDetails.NO,
) => {
  const formatedValue = formatTooltipValue(dataOptions.size, location.value, `${location.value}`);
  const formatedColorValue = formatTooltipValue(
    dataOptions.colorBy,
    location.colorValue,
    `${location.colorValue}`,
  );
  const formatedDetails =
    dataOptions.details &&
    formatTooltipValue(dataOptions.details, location.details as number, `${location.details}`);

  return `
    <div class="csdk-scattermap-tooltip-container">
      <div class="csdk-scattermap-tooltip-content">
        <div>${spanSegment(location.name)}</div>
        <div class="csdk-scattermap-tooltip-row">
        ${dataOptions.size ? formatCategoryHtml(getDataOptionTitle(dataOptions.size)) : ''}
        ${dataOptions.size ? spanSegment(formatedValue) : ''}
        </div>
        <div class="csdk-scattermap-tooltip-row">
        ${dataOptions.colorBy ? formatCategoryHtml(getDataOptionTitle(dataOptions.colorBy)) : ''}
        ${dataOptions.colorBy ? spanSegment(formatedColorValue || TOOLTIP_NO_VALUE) : ''}
        </div>
        <div class="csdk-scattermap-tooltip-row">
        ${
          (showDetails === TooltipShowDetails.LOADING || showDetails === TooltipShowDetails.YES) &&
          dataOptions.details
            ? formatCategoryHtml(getDataOptionTitle(dataOptions.details))
            : ''
        }
        ${showDetails === TooltipShowDetails.LOADING ? formatLoaderIndicatorHtml() : ''}
        ${
          showDetails === TooltipShowDetails.YES &&
          dataOptions.details &&
          isMeasureColumn(dataOptions.details)
            ? spanSegment(formatedDetails || TOOLTIP_NO_VALUE)
            : ''
        }
        </div>
        <div>
        ${
          showDetails === TooltipShowDetails.YES &&
          dataOptions.details &&
          !isMeasureColumn(dataOptions.details)
            ? prepareTooltipDetailsListContent(location.details as string[])
            : ''
        }
        </div>
      </div>
    </div>
  `;
};

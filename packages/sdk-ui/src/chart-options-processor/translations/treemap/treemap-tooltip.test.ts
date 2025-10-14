import { TFunction } from '@sisense/sdk-common';
import get from 'lodash/get';

import { CategoricalChartDataOptionsInternal } from '../../../chart-data-options/types';
import { translation as enTranslation } from '../../../translation/resources/en';
import { TreemapChartDesignOptions } from '../design-options';
import { HighchartsDataPointContext } from '../tooltip-utils';
import { treemapTooltipFormatter } from './treemap-tooltip';

const translateMock = ((path: string) => {
  return get(enTranslation, path, '');
}) as TFunction;

describe('Treemap Chart tooltip formatter', () => {
  const dataOptions = {
    y: [{ column: { title: 'test' } }],
  } as CategoricalChartDataOptionsInternal;

  const designOptions = {} as TreemapChartDesignOptions;

  const node1 = {
    val: 1,
    name: 'One',
  };
  const node2 = {
    val: 2,
    name: 'Two',
  };
  const node3 = {
    val: 3,
    name: 'Three',
  };
  const node4 = {
    val: 4,
    name: 'Four',
  };

  it('single category tooltip', () => {
    const context = {
      color: 'red',
      point: {
        node: {
          ...node1,
          parentNode: node2,
        },
      },
    } as unknown as HighchartsDataPointContext;

    expect(
      treemapTooltipFormatter(context, dataOptions, designOptions, translateMock),
    ).toMatchSnapshot();
  });

  it('three categories tooltip', () => {
    const context = {
      color: 'blue',
      point: {
        node: {
          ...node1,
          parentNode: {
            ...node2,
            parentNode: {
              ...node3,
              parentNode: {
                ...node4,
              },
            },
          },
        },
      },
    } as unknown as HighchartsDataPointContext;

    expect(
      treemapTooltipFormatter(context, dataOptions, designOptions, translateMock),
    ).toMatchSnapshot();
  });

  it('contribution mode', () => {
    const context = {
      color: 'blue',
      point: {
        node: {
          ...node1,
          parentNode: {
            ...node2,
            parentNode: {
              ...node3,
              parentNode: {
                ...node4,
              },
            },
          },
        },
      },
    } as unknown as HighchartsDataPointContext;
    const designOptionsWithContribution = {
      tooltip: { mode: 'contribution' },
    } as TreemapChartDesignOptions;

    expect(
      treemapTooltipFormatter(context, dataOptions, designOptionsWithContribution, translateMock),
    ).toMatchSnapshot();
  });
});

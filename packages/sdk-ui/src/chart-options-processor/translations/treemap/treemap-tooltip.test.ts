import { CategoricalChartDataOptionsInternal } from '../../../chart-data-options/types';
import { TooltipFormatterContextObject } from '@sisense/sisense-charts';
import { TreemapChartDesignOptions } from '../design-options';
import { treemapTooltipFormatter } from './treemap-tooltip';

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
    } as unknown as TooltipFormatterContextObject;

    expect(treemapTooltipFormatter(context, dataOptions, designOptions)).toMatchSnapshot();
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
    } as unknown as TooltipFormatterContextObject;

    expect(treemapTooltipFormatter(context, dataOptions, designOptions)).toMatchSnapshot();
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
    } as unknown as TooltipFormatterContextObject;
    const designOptionsWithContribution = {
      tooltip: { mode: 'contribution' },
    } as TreemapChartDesignOptions;

    expect(
      treemapTooltipFormatter(context, dataOptions, designOptionsWithContribution),
    ).toMatchSnapshot();
  });
});

/** @vitest-environment jsdom */
import { createAttribute, measureFactory } from '@sisense/sdk-data';
import { KpiChart as KpiChartPreact } from '@sisense/sdk-ui-preact';
import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { setupHelper } from '../../helpers/setup-helper';
import { KpiChart, type KpiChartProps } from './kpi-chart';

vi.mock('../../helpers/setup-helper', () => ({
  setupHelper: vi.fn(() => () => null),
}));

const revenue = createAttribute({ name: 'Revenue', type: 'numeric-attribute' });
const dataOptions: KpiChartProps['dataOptions'] = {
  value: measureFactory.sum(revenue, 'Total Revenue'),
  comparison: { type: 'previous-period' },
};

describe('KpiChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mounts without error', () => {
    const wrapper = mount(KpiChart, { props: { dataOptions } });

    expect(wrapper.exists()).toBe(true);
  });

  it('passes the given props to setupHelper with the preact KpiChart', () => {
    const onDataPointClick = vi.fn();

    mount(KpiChart, {
      props: { dataOptions, dataSet: 'Sample ECommerce', onDataPointClick },
    });

    expect(setupHelper).toHaveBeenCalledWith(
      KpiChartPreact,
      expect.objectContaining({
        dataOptions,
        dataSet: 'Sample ECommerce',
        onDataPointClick,
      }),
    );
  });
});

/** @vitest-environment jsdom */
import { WidgetById as WidgetByIdPreact } from '@sisense/sdk-ui-preact';
import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { setupHelper } from '../../helpers/setup-helper';
import { WidgetById, type WidgetByIdProps } from './widget-by-id';

vi.mock('../../helpers/setup-helper', () => ({
  setupHelper: vi.fn(() => () => null),
}));

const requiredProps = {
  widgetOid: 'widget-oid',
  dashboardOid: 'dashboard-oid',
};

describe('WidgetById', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mounts without error', () => {
    const wrapper = mount(WidgetById, { props: requiredProps });

    expect(wrapper.exists()).toBe(true);
  });

  it('passes the config prop to setupHelper with the preact WidgetById', () => {
    const config: WidgetByIdProps['config'] = {
      header: { menu: { enabled: false } },
    };

    mount(WidgetById, { props: { ...requiredProps, config } });

    expect(setupHelper).toHaveBeenCalledWith(
      WidgetByIdPreact,
      expect.objectContaining({ ...requiredProps, config }),
    );
  });
});

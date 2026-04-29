/** @vitest-environment jsdom */
import type { CustomWidgetsContextAdapter } from '@sisense/sdk-ui-preact';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { defineComponent, h, provide, ref } from 'vue';

import {
  customWidgetsContextKey,
  defaultCustomWidgetsContext,
} from '../providers/custom-widgets-provider/custom-widgets-context';
import { useCustomWidgets } from './use-custom-widgets';

const TestHost = defineComponent({
  name: 'TestHost',
  setup() {
    return useCustomWidgets();
  },
  template: '<div />',
});

describe('useCustomWidgets', () => {
  const mountWithCustomWidgetsContext = () => {
    const customWidgetsRef = ref<CustomWidgetsContextAdapter>({
      customWidgetsMap: new Map(defaultCustomWidgetsContext.customWidgetsMap),
    });

    const TestHostProvider = defineComponent({
      name: 'TestHostProvider',
      setup() {
        provide(customWidgetsContextKey, customWidgetsRef);
        return () => h(TestHost);
      },
    });

    const wrapper = mount(TestHostProvider).getComponent(TestHost);
    return { wrapper, customWidgetsRef };
  };

  it('registerCustomWidget adds entry and replaces context for reactivity', () => {
    const { wrapper, customWidgetsRef } = mountWithCustomWidgetsContext();
    const valueBefore = customWidgetsRef.value;

    wrapper.vm.registerCustomWidget('my-widget', { setup: () => () => null } as never);

    expect(wrapper.vm.hasCustomWidget('my-widget')).toBe(true);
    expect(customWidgetsRef.value.customWidgetsMap.has('my-widget')).toBe(true);
    expect(customWidgetsRef.value).not.toBe(valueBefore);
  });

  it('unregisterCustomWidget removes entry and replaces context', () => {
    const { wrapper, customWidgetsRef } = mountWithCustomWidgetsContext();

    wrapper.vm.registerCustomWidget('my-widget', { setup: () => () => null } as never);
    const valueAfterRegister = customWidgetsRef.value;

    wrapper.vm.unregisterCustomWidget('my-widget');

    expect(wrapper.vm.hasCustomWidget('my-widget')).toBe(false);
    expect(customWidgetsRef.value.customWidgetsMap.has('tabber-buttons')).toBe(true);
    expect(customWidgetsRef.value).not.toBe(valueAfterRegister);
  });

  it('unregisterCustomWidget for unknown key does not replace context', () => {
    const { wrapper, customWidgetsRef } = mountWithCustomWidgetsContext();
    const valueBefore = customWidgetsRef.value;

    wrapper.vm.unregisterCustomWidget('never-registered');

    expect(customWidgetsRef.value).toBe(valueBefore);
  });

  it('allows register again after unregister', () => {
    const { wrapper } = mountWithCustomWidgetsContext();
    const stub = { setup: () => () => null } as never;

    wrapper.vm.registerCustomWidget('reusable', stub);
    wrapper.vm.unregisterCustomWidget('reusable');
    wrapper.vm.registerCustomWidget('reusable', stub);

    expect(wrapper.vm.hasCustomWidget('reusable')).toBe(true);
  });
});

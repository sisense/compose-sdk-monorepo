import { createElement } from 'react';

import { render } from '@testing-library/react';

import { TabberButtonsWidget } from '@/domains/widgets/components/tabber-buttons-widget';

import { PLUGIN_ABILITY_DEFAULTS } from '../widget-identity/ability-defaults';
import { familyOfKey } from '../widget-identity/widget-key';
import { BUILT_IN_WIDGET_DEFINITIONS } from './built-in-definitions';
import { eraseWidgetDefinition, renderWidgetBody } from './erase-widget-definition';
import type { WidgetDefinition } from './types';

describe('BUILT_IN_WIDGET_DEFINITIONS', () => {
  it('is frozen, and so is every definition', () => {
    expect(Object.isFrozen(BUILT_IN_WIDGET_DEFINITIONS)).toBe(true);
    BUILT_IN_WIDGET_DEFINITIONS.forEach((definition) => {
      expect(Object.isFrozen(definition)).toBe(true);
    });
  });

  it('holds only the tabber', () => {
    expect([...BUILT_IN_WIDGET_DEFINITIONS.keys()]).toEqual(['custom:tabber-buttons']);
  });

  it('keys every definition by its own key', () => {
    BUILT_IN_WIDGET_DEFINITIONS.forEach((definition, key) => {
      expect(definition.key).toBe(key);
      expect(definition.displayName).not.toBe('');
    });
  });

  it('renders the tabber with the tabber component', () => {
    const tabber = BUILT_IN_WIDGET_DEFINITIONS.get('custom:tabber-buttons');

    expect(tabber?.visualization.Component).toBe(TabberButtonsWidget);
    expect(tabber && familyOfKey(tabber.key)).toBe('custom');
  });

  it('declares what the tabber is, not the plugin defaults', () => {
    expect(BUILT_IN_WIDGET_DEFINITIONS.get('custom:tabber-buttons')?.abilities).toEqual({
      data: 'none',
      interactions: [],
      highlights: false,
      drilldown: false,
      layout: { autoHeight: false, defaultSize: { width: 512, height: 32 } },
    });
  });
});

describe('renderWidgetBody', () => {
  it('renders the body of an erased definition with the forwarded props', () => {
    type Props = { dataOptions: object; label: string };
    const Body = ({ label }: Props) => createElement('span', null, label);
    const definition: WidgetDefinition<Props> = {
      key: 'custom:body',
      displayName: 'Body',
      abilities: PLUGIN_ABILITY_DEFAULTS,
      visualization: { Component: Body },
    };

    const { getByText } = render(
      renderWidgetBody(eraseWidgetDefinition(definition), { dataOptions: {}, label: 'hello' }),
    );

    expect(getByText('hello')).toBeTruthy();
  });
});

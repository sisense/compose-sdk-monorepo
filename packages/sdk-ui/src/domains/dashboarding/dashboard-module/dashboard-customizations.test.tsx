import { FunctionComponent } from 'react';

import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MockedSisenseContextProvider } from '@/__test-helpers__';
import { withHeaderItem } from '@/domains/dashboarding/dashboard-helpers';
import { DashboardProps } from '@/domains/dashboarding/types';
import { useComposedDashboardInternal } from '@/domains/dashboarding/use-composed-dashboard';
import { WidgetProps } from '@/domains/widgets/components/widget/types';
import { ModalProvider } from '@/infra/contexts/modal-provider/modal-provider';
import { Module } from '@/infra/modules';

import { DashboardCustomization, DashboardStateApi } from './types.js';

const makeWidget = (id: string): WidgetProps => ({
  id,
  widgetType: 'text',
  styleOptions: { html: `<div>${id}</div>`, vAlign: 'valign-middle', bgColor: '#fff' },
});

// useComposedDashboardInternal pulls in jump-to-dashboard logic, which needs a modal root (the
// Dashboard component provides its own; a bare hook harness must supply one).
const renderHarness = (initial: DashboardProps, modules?: Module[]) =>
  render(
    <MockedSisenseContextProvider modules={modules}>
      <ModalProvider>
        <Harness initial={initial} />
      </ModalProvider>
    </MockedSisenseContextProvider>,
  );

const Harness: FunctionComponent<{ initial: DashboardProps }> = ({ initial }) => {
  const { dashboard } = useComposedDashboardInternal(initial);
  return (
    <div>
      <span data-testid="count">{dashboard.widgets.length}</span>
      <span data-testid="header">{dashboard.config?.header?.items?.length ?? 0}</span>
    </div>
  );
};

describe('useComposedDashboard customizations', () => {
  it('applies registered customizations and exposes a working state api (addWidget)', () => {
    let captured: DashboardStateApi | undefined;
    const customization: DashboardCustomization = (dashboard, stateApi) => {
      captured = stateApi;
      return withHeaderItem({ id: 'ai', component: () => null })(dashboard);
    };
    const contributor: Module = {
      name: 'test-contrib',
      version: '1.0.0',
      requires: ['dashboard'],
      integrations: { dashboard: { customizations: [customization] } },
    };

    renderHarness({ widgets: [makeWidget('w1')] }, [contributor]);

    expect(screen.getByTestId('count').textContent).toBe('1');
    expect(screen.getByTestId('header').textContent).toBe('1');
    expect(captured).toBeDefined();

    act(() => {
      captured?.addWidget(makeWidget('w2'));
    });

    expect(screen.getByTestId('count').textContent).toBe('2');
    // The customization re-applies without accumulating header items.
    expect(screen.getByTestId('header').textContent).toBe('1');
  });

  it('is a no-op when no customizations are registered', () => {
    renderHarness({ widgets: [makeWidget('w1')] });

    expect(screen.getByTestId('count').textContent).toBe('1');
    expect(screen.getByTestId('header').textContent).toBe('0');
  });
});

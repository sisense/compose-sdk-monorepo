/** @vitest-environment jsdom */
import { render } from '@testing-library/react';
import { describe, expect, it, Mock, vi } from 'vitest';

import type { HeaderItem } from '@/domains/shared/header';

import { WidgetErrorsAndWarningsProvider } from '../../widget-errors-and-warnings-context';
import WidgetHeaderInfoButton from '../widget-header-info-button';
import { WidgetHeaderTargets } from '../widget-header-targets';
import {
  useWidgetHeaderInfoButton,
  UseWidgetHeaderInfoButtonParams,
} from './use-widget-header-info-button';

vi.mock('../widget-header-info-button', () => ({
  default: vi.fn(() => <div data-testid="widget-header-info-button">Info</div>),
}));

const mockInfoButton = WidgetHeaderInfoButton as unknown as Mock;

/** Renders the item the hook contributed, inside the provider the real header puts it in. */
const renderInfoButtonItem = (params: UseWidgetHeaderInfoButtonParams) => {
  const result: { id?: string } = {};
  const Host = () => {
    const headerConfig = useWidgetHeaderInfoButton(undefined, params);
    const item = (headerConfig.items as HeaderItem[])[0];
    result.id = item.id;
    return <>{item.component({ size: { width: 28, height: 28 } })}</>;
  };
  return {
    ...render(
      <WidgetErrorsAndWarningsProvider>
        <Host />
      </WidgetErrorsAndWarningsProvider>,
    ),
    result,
  };
};

describe('useWidgetHeaderInfoButton', () => {
  beforeEach(() => vi.clearAllMocks());

  it('contributes an item claiming the info button slot', () => {
    const { result } = renderInfoButtonItem({});

    expect(result.id).toBe(WidgetHeaderTargets.InfoButton);
  });

  it('renders the button with the dataset name, description and style options', () => {
    const onRefresh = vi.fn();
    const styleOptions = { titleTextColor: '#abcdef' };
    const { getByTestId } = renderInfoButtonItem({
      dataSetName: 'Sample ECommerce',
      description: 'Sample dataset',
      styleOptions,
      onRefresh,
    });

    expect(getByTestId('widget-header-info-button')).toBeInTheDocument();
    expect(mockInfoButton).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Sample ECommerce',
        description: 'Sample dataset',
        styleOptions,
        onRefresh,
      }),
      undefined,
    );
  });

  it('reads errors and warnings from the widget context rather than from params', () => {
    // Nothing is threaded down for them: the item renders inside the provider that collects them.
    renderInfoButtonItem({});

    expect(mockInfoButton).toHaveBeenCalledWith(
      expect.objectContaining({ errorMessages: [], warningMessages: [] }),
      undefined,
    );
  });
});

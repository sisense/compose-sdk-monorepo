/** @vitest-environment jsdom */
import { createAttribute, filterFactory } from '@sisense/sdk-data';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ConditionFilter } from './condition-filter.js';
import { numericConditionToFilter } from './condition-numeric.js';
import { textConditionToFilter } from './condition-text.js';

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return { ...actual, useTranslation: () => ({ t: (key: string) => key }) };
});

vi.mock('@/domains/filters/hooks/use-get-filter-members', () => ({
  useGetFilterMembersInternal: () => ({
    data: {
      allMembers: [
        { key: 'Cardiology', title: 'Cardiology' },
        { key: 'Radiology', title: 'Radiology' },
        { key: 'Neurology', title: 'Neurology' },
        { key: 'Ukraine', title: 'Ukraine' },
      ],
      selectedMembers: [],
      excludeMembers: false,
      enableMultiSelection: true,
      hasBackgroundFilter: false,
    },
    loadMore: vi.fn(),
    isLoading: false,
    isAllItemsLoaded: true,
  }),
}));

const attribute = createAttribute({
  name: 'Country',
  expression: '[Commerce.Country]',
  type: 'text',
});

const numericAttribute = createAttribute({
  name: 'Revenue',
  expression: '[Commerce.Revenue]',
  type: 'numeric',
});

const openPanel = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByTestId('filter-widget-condition-trigger'));
  expect(screen.getByTestId('filter-widget-condition-panel')).toBeInTheDocument();
};

/**
 * Returns the hover target for the closed Condition trigger (Field wraps the input).
 * @returns The Field element that owns the trigger's hover handlers.
 */
const getConditionTriggerHoverTarget = (): HTMLElement => {
  const parent = screen.getByTestId('filter-widget-condition-trigger').parentElement;
  if (!parent) {
    throw new Error('Expected condition trigger to have a parentElement');
  }
  return parent;
};

/** Makes the closed trigger read as truncated so the hover tooltip can appear. */
const stubTriggerOverflow = () => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: ResizeObserverCallback) {
        callback([], this);
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(80);
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    font: '',
    measureText: (text: string) => ({ width: text.length * 10 }),
  } as unknown as CanvasRenderingContext2D);
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const renderConditionFilter = (overrides: Partial<Parameters<typeof ConditionFilter>[0]> = {}) => {
  const onFilterUpdate = vi.fn();
  const view = render(
    <ConditionFilter attribute={attribute} onFilterUpdate={onFilterUpdate} {...overrides} />,
  );
  return { ...view, onFilterUpdate };
};

const renderNumericConditionFilter = (
  overrides: Partial<Parameters<typeof ConditionFilter>[0]> = {},
) => renderConditionFilter({ attribute: numericAttribute, conditionKind: 'numeric', ...overrides });

describe('ConditionFilter (text)', () => {
  it('shows a validation message and blocks Apply when a chained row is incomplete', async () => {
    const user = userEvent.setup();
    const { onFilterUpdate } = renderConditionFilter();
    await openPanel(user);

    await user.type(screen.getByTestId('filter-widget-condition-value'), 'cardio');
    await user.click(screen.getByTestId('filter-widget-condition-add'));
    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    expect(onFilterUpdate).not.toHaveBeenCalled();
    expect(screen.getByText('filterWidget.controls.fillOrRemoveCondition')).toBeInTheDocument();
  });

  it('abandons draft edits on Cancel without publishing', async () => {
    const user = userEvent.setup();
    const filter = filterFactory.contains(attribute, 'cardio');
    const { onFilterUpdate } = renderConditionFilter({ filter });

    await openPanel(user);
    const valueInput = screen.getByTestId('filter-widget-condition-value');
    await user.clear(valueInput);
    await user.type(valueInput, 'neuro');
    await user.click(screen.getByTestId('filter-widget-panel-cancel'));

    expect(onFilterUpdate).not.toHaveBeenCalled();
    expect(screen.getByTestId('filter-widget-condition-trigger')).toHaveValue(
      'filterEditor.conditions.contains cardio',
    );
    expect(screen.queryByTestId('filter-widget-condition-panel')).not.toBeInTheDocument();
  });

  it('opens the operator drill-in and applies the picked operator', async () => {
    const user = userEvent.setup();
    const { onFilterUpdate } = renderConditionFilter();
    await openPanel(user);

    await user.click(screen.getByTestId('filter-widget-condition-operator'));
    expect(screen.getByTestId('filter-widget-panel-back')).toBeInTheDocument();
    expect(screen.getByText('filterWidget.controls.selectCondition')).toBeInTheDocument();

    const endsWith = screen
      .getAllByTestId('filter-widget-select-option')
      .find((node) => node.textContent?.includes('filterEditor.conditions.endsWith'));
    expect(endsWith).toBeDefined();
    await user.click(endsWith!);

    await user.type(screen.getByTestId('filter-widget-condition-value'), 'logy');
    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    expect(onFilterUpdate).toHaveBeenCalledTimes(1);
    expect(onFilterUpdate.mock.calls[0][0].filterJaql()).toEqual({ endsWith: 'logy' });
  });

  it('adds and removes chained rows in the panel', async () => {
    const user = userEvent.setup();
    renderConditionFilter();
    await openPanel(user);

    await user.type(screen.getByTestId('filter-widget-condition-value'), 'cardio');
    await user.click(screen.getByTestId('filter-widget-condition-add'));
    expect(screen.getByTestId('filter-widget-condition-chain-row')).toBeInTheDocument();

    const removeButtons = screen.getAllByTestId('filter-widget-condition-remove');
    await user.click(removeButtons[removeButtons.length - 1]);
    expect(screen.queryByTestId('filter-widget-condition-chain-row')).not.toBeInTheDocument();
  });

  it('shows the full chain on hover of the closed trigger', async () => {
    stubTriggerOverflow();
    const user = userEvent.setup();
    const filter = textConditionToFilter(attribute, {
      op: 'contains',
      text: 'cardio',
      connector: 'AND',
      extra: [{ id: 'a', op: 'ends-with', text: 'ology' }],
    });
    renderConditionFilter({ filter });
    const box = getConditionTriggerHoverTarget();

    expect(screen.queryByTestId('filter-widget-select-tooltip')).not.toBeInTheDocument();

    await user.hover(box);

    const tip = screen.getByTestId('filter-widget-select-tooltip');
    expect(tip).toHaveTextContent('filterEditor.conditions.contains cardio');
    expect(tip).toHaveTextContent('AND filterEditor.conditions.endsWith ology');
  });

  it('withholds the chain tooltip while the panel is open', async () => {
    const user = userEvent.setup();
    const filter = textConditionToFilter(attribute, {
      op: 'contains',
      text: 'cardio',
      connector: 'AND',
      extra: [{ id: 'a', op: 'ends-with', text: 'ology' }],
    });
    renderConditionFilter({ filter });
    await openPanel(user);

    await user.hover(getConditionTriggerHoverTarget());

    expect(screen.queryByTestId('filter-widget-select-tooltip')).not.toBeInTheDocument();
  });

  it('does not tooltip a short single condition that already fits', async () => {
    const user = userEvent.setup();
    renderConditionFilter({ filter: filterFactory.contains(attribute, 'a') });
    const box = getConditionTriggerHoverTarget();

    await user.hover(box);

    expect(screen.queryByTestId('filter-widget-select-tooltip')).not.toBeInTheDocument();
    expect(box).not.toHaveAttribute('title');
  });

  it('offers matching members inline while typing a text value', async () => {
    const user = userEvent.setup();
    renderConditionFilter();
    await openPanel(user);

    await user.type(screen.getByTestId('filter-widget-condition-value'), 'd');

    const hints = screen.getByTestId('filter-widget-condition-hints');
    expect(hints).toHaveTextContent('Cardiology');
    expect(hints).toHaveTextContent('Radiology');
    expect(screen.queryByText('Neurology')).not.toBeInTheDocument();
  });

  it('fills the value from a hint and then hides the list', async () => {
    const user = userEvent.setup();
    renderConditionFilter();
    await openPanel(user);

    await user.type(screen.getByTestId('filter-widget-condition-value'), 'd');
    await user.click(screen.getByText('Cardiology'));

    expect(screen.getByTestId('filter-widget-condition-value')).toHaveValue('Cardiology');
    expect(screen.queryByTestId('filter-widget-condition-hints')).not.toBeInTheDocument();
  });

  it('selects a highlighted hint with ArrowDown and Enter', async () => {
    const user = userEvent.setup();
    renderConditionFilter();
    await openPanel(user);

    const value = screen.getByTestId('filter-widget-condition-value');
    await user.type(value, 'd');
    expect(screen.getByTestId('filter-widget-condition-hints')).toBeInTheDocument();

    await user.keyboard('{ArrowDown}');
    expect(value).toHaveAttribute(
      'aria-activedescendant',
      'filter-widget-condition-hints-primary-Cardiology',
    );

    await user.keyboard('{Enter}');
    expect(value).toHaveValue('Cardiology');
    expect(screen.queryByTestId('filter-widget-condition-hints')).not.toBeInTheDocument();
  });

  it('opens a saved condition without hinting until the value is being typed', async () => {
    const user = userEvent.setup();
    renderConditionFilter({ filter: filterFactory.contains(attribute, 'cardio') });
    await openPanel(user);

    expect(screen.queryByTestId('filter-widget-condition-hints')).not.toBeInTheDocument();

    await user.click(screen.getByTestId('filter-widget-condition-value'));
    expect(screen.getByTestId('filter-widget-condition-hints')).toHaveTextContent('Cardiology');
  });

  it('hides hints once the typed value is already a member', async () => {
    const user = userEvent.setup();
    renderConditionFilter();
    await openPanel(user);

    await user.type(screen.getByTestId('filter-widget-condition-value'), 'Cardiology');
    expect(screen.queryByTestId('filter-widget-condition-hints')).not.toBeInTheDocument();
  });
});

describe('ConditionFilter (numeric)', () => {
  it('applies a greater-than numeric condition', async () => {
    const user = userEvent.setup();
    const { onFilterUpdate } = renderNumericConditionFilter();
    await openPanel(user);

    await user.click(screen.getByTestId('filter-widget-condition-operator'));
    const gt = screen
      .getAllByTestId('filter-widget-select-option')
      .find((node) => node.textContent?.includes('filterEditor.conditions.greaterThan'));
    expect(gt).toBeDefined();
    expect(gt).toHaveTextContent('>');
    await user.click(gt!);

    await user.type(screen.getByTestId('filter-widget-condition-value'), '100');
    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    expect(onFilterUpdate).toHaveBeenCalledTimes(1);
    expect(onFilterUpdate.mock.calls[0][0].filterJaql()).toEqual({ fromNotEqual: 100 });
  });

  it('does not offer member hints under a numeric value', async () => {
    const user = userEvent.setup();
    renderNumericConditionFilter();
    await openPanel(user);

    await user.type(screen.getByTestId('filter-widget-condition-value'), '100');
    expect(screen.queryByTestId('filter-widget-condition-hints')).not.toBeInTheDocument();
  });

  it('applies a between numeric condition', async () => {
    const user = userEvent.setup();
    const { onFilterUpdate } = renderNumericConditionFilter();
    await openPanel(user);

    await user.click(screen.getByTestId('filter-widget-condition-operator'));
    const between = screen
      .getAllByTestId('filter-widget-select-option')
      .find((node) => node.textContent?.includes('filterEditor.conditions.between'));
    expect(between).toBeDefined();
    await user.click(between!);

    await user.type(screen.getByTestId('filter-widget-condition-between-min'), '10');
    await user.type(screen.getByTestId('filter-widget-condition-between-max'), '20');
    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    expect(onFilterUpdate).toHaveBeenCalledTimes(1);
    expect(onFilterUpdate.mock.calls[0][0].filterJaql()).toEqual({ from: 10, to: 20 });
  });

  it('blocks Apply when between max is not higher than min', async () => {
    const user = userEvent.setup();
    const { onFilterUpdate } = renderNumericConditionFilter();
    await openPanel(user);

    await user.click(screen.getByTestId('filter-widget-condition-operator'));
    const between = screen
      .getAllByTestId('filter-widget-select-option')
      .find((node) => node.textContent?.includes('filterEditor.conditions.between'));
    expect(between).toBeDefined();
    await user.click(between!);

    await user.type(screen.getByTestId('filter-widget-condition-between-min'), '20');
    await user.type(screen.getByTestId('filter-widget-condition-between-max'), '10');
    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    expect(onFilterUpdate).not.toHaveBeenCalled();
    expect(screen.getByText('filterWidget.controls.rangeOrderError')).toBeInTheDocument();
  });

  it('applies an AND chain of numeric conditions', async () => {
    const user = userEvent.setup();
    const { onFilterUpdate } = renderNumericConditionFilter();
    await openPanel(user);

    await user.type(screen.getByTestId('filter-widget-condition-value'), '100');
    await user.click(screen.getByTestId('filter-widget-condition-add'));
    expect(screen.getByTestId('filter-widget-condition-chain-row')).toBeInTheDocument();

    await user.type(screen.getByTestId('filter-widget-condition-chain-value'), '500');
    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    expect(onFilterUpdate).toHaveBeenCalledTimes(1);
    expect(onFilterUpdate.mock.calls[0][0].filterJaql()).toEqual({
      and: [{ equals: 100 }, { equals: 500 }],
    });
  });

  it('blocks Apply for invalid numeric input', async () => {
    const user = userEvent.setup();
    const { onFilterUpdate } = renderNumericConditionFilter();
    await openPanel(user);

    await user.type(screen.getByTestId('filter-widget-condition-value'), 'mkk');
    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    expect(onFilterUpdate).not.toHaveBeenCalled();
    expect(screen.getByText('filterEditor.validationErrors.invalidNumber')).toBeInTheDocument();
  });

  it('clears on Apply when the lone value field is blank', async () => {
    const user = userEvent.setup();
    const filter = filterFactory.greaterThan(numericAttribute, 100);
    const { onFilterUpdate } = renderNumericConditionFilter({ filter });
    await openPanel(user);

    await user.clear(screen.getByTestId('filter-widget-condition-value'));
    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    expect(onFilterUpdate).toHaveBeenCalledWith(null);
  });

  it('omits comparison glyphs from a short closed trigger', () => {
    renderNumericConditionFilter({ filter: filterFactory.equals(numericAttribute, 5) });

    expect(screen.getByTestId('filter-widget-condition-trigger')).toHaveValue(
      'filterEditor.conditions.equals 5',
    );
  });

  it('keeps comparison glyphs in the operator list, not on the closed trigger or tooltip', async () => {
    stubTriggerOverflow();
    const user = userEvent.setup();
    const filter = numericConditionToFilter(numericAttribute, {
      op: 'lte',
      number: '5000',
      min: '',
      max: '',
      connector: 'AND',
      extra: [{ id: 'a', op: 'gte', number: '2' }],
    });
    renderNumericConditionFilter({ filter });

    expect(screen.getByTestId('filter-widget-condition-trigger')).toHaveValue(
      'filterEditor.conditions.lessThanOrEqual 5000 AND filterEditor.conditions.greaterThanOrEqual 2',
    );

    await user.hover(getConditionTriggerHoverTarget());
    const tip = screen.getByTestId('filter-widget-select-tooltip');
    expect(tip).toHaveTextContent('filterEditor.conditions.lessThanOrEqual 5000');
    expect(tip).toHaveTextContent('AND filterEditor.conditions.greaterThanOrEqual 2');
    expect(tip).not.toHaveTextContent('≤');
    expect(tip).not.toHaveTextContent('≥');
  });
});

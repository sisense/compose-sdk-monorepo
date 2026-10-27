/** @vitest-environment jsdom */
import {
  createAttribute,
  DateLevels,
  type DimensionalLevelAttribute,
  type Filter,
  filterFactory,
  isRankingFilter,
  measureFactory,
  type RankingFilter,
} from '@sisense/sdk-data';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import get from 'lodash-es/get';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Commerce } from '@/__test-helpers__/sample-ecommerce';
import { translation } from '@/infra/translation/resources/en';

import { RankFilter } from './rank-filter.js';

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  /* Resolves against the real English dictionary and interpolates, as i18next would. */
  const t = (key: string, options: Record<string, unknown> = {}) => {
    const template = (get(translation, key) as string | undefined) ?? key;
    return template.replace(/{{-?\s*(\w+)\s*}}/g, (_, name: string) => String(options[name] ?? ''));
  };
  return { ...actual, useTranslation: () => ({ t }) };
});

const attribute = createAttribute({
  name: 'Country',
  expression: '[Commerce.Country]',
  type: 'text',
});
const numericAttribute = createAttribute({
  name: 'Quantity',
  expression: '[Commerce.Quantity]',
  type: 'numeric',
});
const dateAttribute = Commerce.Date.Years;

const revenue = measureFactory.customFormula('Weighted Revenue', 'SUM([rev]) * 2', {
  rev: Commerce.Revenue,
});

const TRIGGER = 'filter-widget-rank-trigger';
const PANEL = 'filter-widget-rank-panel';

afterEach(() => {
  vi.restoreAllMocks();
});

const renderRankFilter = (overrides: Partial<Parameters<typeof RankFilter>[0]> = {}) => {
  const onFilterUpdate = vi.fn();
  const view = render(
    <RankFilter
      attribute={attribute}
      rankBy={revenue}
      onFilterUpdate={onFilterUpdate}
      {...overrides}
    />,
  );
  return { ...view, onFilterUpdate };
};

const openPanel = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByTestId(TRIGGER));
  expect(screen.getByTestId(PANEL)).toBeInTheDocument();
};

/**
 * Returns the hover target for the trigger (Field wraps the input and owns the hover handlers).
 * @returns The element that receives pointer events for the trigger.
 */
const getTriggerHoverTarget = (): HTMLElement => {
  const parent = screen.getByTestId(TRIGGER).parentElement;
  if (!parent) throw new Error('Expected the rank trigger to have a parentElement');
  return parent;
};

/**
 * Returns the rows of the hover bubble, one string per line.
 * @returns The text of each child of the tooltip.
 */
const hoverRows = (): string[] =>
  Array.from(screen.getByTestId('filter-widget-select-tooltip').children).map(
    (row) => row.textContent ?? '',
  );

const publishedFilter = (onFilterUpdate: ReturnType<typeof vi.fn>, call = 0) =>
  onFilterUpdate.mock.calls[call][0] as RankingFilter;

const pickOption = async (user: ReturnType<typeof userEvent.setup>, text: string) => {
  const option = screen
    .getAllByTestId('filter-widget-select-option')
    .find((node) => node.textContent?.includes(text));
  if (!option) throw new Error(`No option "${text}"`);
  await user.click(option);
};

describe('filter-widget-rank.unit:no-ranked-by', () => {
  it('shows a disabled "Set filter" trigger when no measure is set', () => {
    renderRankFilter({ rankBy: undefined });

    const trigger = screen.getByTestId(TRIGGER);
    expect(trigger).toHaveValue('Set filter');
    expect(trigger).toHaveAttribute('aria-disabled', 'true');
  });

  it('tells the user where to choose a field, on hover', async () => {
    const user = userEvent.setup();
    renderRankFilter({ rankBy: undefined });

    await user.hover(getTriggerHoverTarget());

    expect(screen.getByTestId('filter-widget-select-tooltip')).toHaveTextContent(
      'Choose a field to rank by in: Filter Settings › Ranked by',
    );
  });

  it('shows the same hint to a keyboard user who focuses the trigger', async () => {
    const user = userEvent.setup();
    renderRankFilter({ rankBy: undefined });

    await user.tab();

    expect(screen.getByTestId(TRIGGER)).toHaveFocus();
    expect(screen.getByTestId('filter-widget-select-tooltip')).toHaveTextContent(
      'Choose a field to rank by',
    );
  });

  it('opens no panel on click, Enter or Space', async () => {
    const user = userEvent.setup();
    const { onFilterUpdate } = renderRankFilter({ rankBy: undefined });

    await user.click(screen.getByTestId(TRIGGER));
    await user.keyboard('{Enter}');
    await user.keyboard(' ');

    expect(screen.queryByTestId(PANEL)).not.toBeInTheDocument();
    expect(onFilterUpdate).not.toHaveBeenCalled();
  });
});

describe('filter-widget-rank.unit:empty-state', () => {
  it('reads "Ranked by <field>" on the trigger with nothing applied', () => {
    renderRankFilter();

    expect(screen.getByTestId(TRIGGER)).toHaveValue('Ranked by Weighted Revenue');
    expect(screen.getByTestId(TRIGGER)).not.toHaveAttribute('aria-disabled');
  });

  it('shows the label and the measure on two rows on hover, even when the text fits', async () => {
    const user = userEvent.setup();
    renderRankFilter();

    await user.hover(getTriggerHoverTarget());

    expect(hoverRows()).toEqual(['Ranked by:', 'Weighted Revenue']);
  });

  it('offers no ✕ when nothing is applied', async () => {
    const user = userEvent.setup();
    renderRankFilter();

    await user.hover(getTriggerHoverTarget());

    expect(screen.queryByTestId('filter-widget-select-clear')).not.toBeInTheDocument();
  });

  it('reads a filter that is not a ranking as nothing applied', () => {
    renderRankFilter({ filter: filterFactory.members(attribute, ['Ukraine']) });

    expect(screen.getByTestId(TRIGGER)).toHaveValue('Ranked by Weighted Revenue');
  });
});

describe('filter-widget-rank.unit:anatomy', () => {
  it('lays the panel out as direction, count, Ranked by box, then the footer', async () => {
    const user = userEvent.setup();
    renderRankFilter();
    await openPanel(user);

    const ordered = [
      'filter-widget-rank-direction',
      'filter-widget-rank-count',
      'filter-widget-rank-ranked-by',
      'filter-widget-panel-clear',
      'filter-widget-panel-cancel',
      'filter-widget-panel-apply',
    ].map((id) => screen.getByTestId(id));

    ordered.slice(1).forEach((node, index) => {
      expect(
        ordered[index].compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });
  });

  it('puts no date level control on a text attribute', async () => {
    const user = userEvent.setup();
    renderRankFilter();
    await openPanel(user);

    expect(screen.queryByTestId('filter-widget-rank-grain')).not.toBeInTheDocument();
  });

  it('shows the Ranked by field as plain read-only text under its label', async () => {
    const user = userEvent.setup();
    renderRankFilter();
    await openPanel(user);

    const box = screen.getByTestId('filter-widget-rank-ranked-by');
    expect(box).toHaveTextContent('Weighted Revenue');
    expect(screen.getByText('Ranked by:')).toBeInTheDocument();
    expect(within(box).queryByRole('textbox')).not.toBeInTheDocument();
    expect(box.closest('button')).toBeNull();
    await user.click(box);
    expect(screen.getByTestId(PANEL)).toBeInTheDocument();
    expect(screen.queryByTestId('filter-widget-panel-back')).not.toBeInTheDocument();
  });

  it('wraps a long Ranked by name in the box rather than cutting it', async () => {
    const longName = 'Average of a very long measure name that could never fit on a single line';
    const measure = measureFactory.customFormula(longName, 'SUM([rev])', { rev: Commerce.Revenue });
    const user = userEvent.setup();
    renderRankFilter({ rankBy: measure });
    await openPanel(user);

    expect(screen.getByTestId('filter-widget-rank-ranked-by')).toHaveTextContent(longName);
  });
});

describe('filter-widget-rank.unit:defaults', () => {
  it('opens a text attribute on Top 10 and publishes nothing', async () => {
    const user = userEvent.setup();
    const { onFilterUpdate } = renderRankFilter();
    await openPanel(user);

    expect(screen.getByTestId('filter-widget-rank-direction')).toHaveValue('Top');
    expect(screen.getByTestId('filter-widget-rank-count')).toHaveValue('10');
    expect(onFilterUpdate).not.toHaveBeenCalled();
  });

  it('opens a numeric attribute on Top 10', async () => {
    const user = userEvent.setup();
    renderRankFilter({ attribute: numericAttribute });
    await openPanel(user);

    expect(screen.getByTestId('filter-widget-rank-count')).toHaveValue('10');
  });

  it('opens a datetime attribute on Top 1 at Year', async () => {
    const user = userEvent.setup();
    renderRankFilter({ attribute: dateAttribute });
    await openPanel(user);

    expect(screen.getByTestId('filter-widget-rank-count')).toHaveValue('1');
    expect(screen.getByTestId('filter-widget-rank-grain')).toHaveValue('Year');
  });

  it('re-opens an applied ranking with its own values', async () => {
    const user = userEvent.setup();
    const filter = filterFactory.bottomRanking(attribute, revenue, 7);
    renderRankFilter({ filter });
    await openPanel(user);

    expect(screen.getByTestId('filter-widget-rank-direction')).toHaveValue('Bottom');
    expect(screen.getByTestId('filter-widget-rank-count')).toHaveValue('7');
  });
});

describe('filter-widget-rank.unit:count-input', () => {
  const typeCount = async (user: ReturnType<typeof userEvent.setup>, text: string) => {
    const input = screen.getByTestId('filter-widget-rank-count');
    await user.clear(input);
    if (text) await user.type(input, text);
    return input;
  };

  it.each([
    ['0', ''],
    ['abc', ''],
    ['1.1', '11'],
    ['007', '7'],
    ['25', '25'],
    ['1000000', '1000000'],
  ])('keeps %j as %j', async (typed, kept) => {
    const user = userEvent.setup();
    renderRankFilter();
    await openPanel(user);

    expect(await typeCount(user, typed)).toHaveValue(kept);
  });

  it('shows no error for a rejected character', async () => {
    const user = userEvent.setup();
    renderRankFilter();
    await openPanel(user);

    await typeCount(user, 'x');

    expect(screen.getByTestId('filter-widget-rank-count')).not.toHaveAttribute('aria-invalid');
  });

  it('steps with the arrows and stops at 1 going down', async () => {
    const user = userEvent.setup();
    renderRankFilter();
    await openPanel(user);
    await typeCount(user, '2');

    await user.click(screen.getByTestId('filter-widget-rank-count-down'));
    expect(screen.getByTestId('filter-widget-rank-count')).toHaveValue('1');
    await user.click(screen.getByTestId('filter-widget-rank-count-down'));
    expect(screen.getByTestId('filter-widget-rank-count')).toHaveValue('1');
    await user.click(screen.getByTestId('filter-widget-rank-count-up'));
    expect(screen.getByTestId('filter-widget-rank-count')).toHaveValue('2');
  });

  it('gives 1 when stepping up from an empty field', async () => {
    const user = userEvent.setup();
    renderRankFilter();
    await openPanel(user);
    await typeCount(user, '');

    await user.click(screen.getByTestId('filter-widget-rank-count-up'));

    expect(screen.getByTestId('filter-widget-rank-count')).toHaveValue('1');
  });

  it('steps with ArrowUp and ArrowDown from the keyboard', async () => {
    const user = userEvent.setup();
    renderRankFilter();
    await openPanel(user);
    const input = await typeCount(user, '5');

    await user.keyboard('{ArrowUp}{ArrowUp}');
    expect(input).toHaveValue('7');
    await user.keyboard('{ArrowDown}');
    expect(input).toHaveValue('6');
  });

  it('names the stepper buttons and the field for assistive technology', async () => {
    const user = userEvent.setup();
    renderRankFilter();
    await openPanel(user);

    expect(screen.getByLabelText('Number of members')).toBe(
      screen.getByTestId('filter-widget-rank-count'),
    );
    expect(screen.getByTestId('filter-widget-rank-count-up')).toHaveAccessibleName('Increase');
    expect(screen.getByTestId('filter-widget-rank-count-down')).toHaveAccessibleName('Decrease');
  });

  it('publishes include-all when Apply finds the count empty', async () => {
    const user = userEvent.setup();
    const { onFilterUpdate } = renderRankFilter({
      filter: filterFactory.topRanking(attribute, revenue, 5),
    });
    await openPanel(user);
    await typeCount(user, '');

    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    expect(onFilterUpdate).toHaveBeenCalledTimes(1);
    expect(onFilterUpdate).toHaveBeenCalledWith(null);
    expect(screen.queryByTestId(PANEL)).not.toBeInTheDocument();
  });
});

describe('filter-widget-rank.unit:panel-transaction', () => {
  it('publishes once on Apply, a RankingFilter of the chosen direction and count, and closes', async () => {
    const user = userEvent.setup();
    const { onFilterUpdate } = renderRankFilter();
    await openPanel(user);

    await user.click(screen.getByTestId('filter-widget-rank-direction'));
    await pickOption(user, 'Bottom');
    const count = screen.getByTestId('filter-widget-rank-count');
    await user.clear(count);
    await user.type(count, '3');
    expect(onFilterUpdate).not.toHaveBeenCalled();
    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    expect(onFilterUpdate).toHaveBeenCalledTimes(1);
    const filter = publishedFilter(onFilterUpdate);
    expect(isRankingFilter(filter)).toBe(true);
    expect(filter.filterJaql()).toEqual({ bottom: 3, by: revenue.jaql(true) });
    expect(screen.queryByTestId(PANEL)).not.toBeInTheDocument();
  });

  it('publishes nothing on Cancel and restores what the panel opened with', async () => {
    const user = userEvent.setup();
    const filter = filterFactory.topRanking(attribute, revenue, 5);
    const { onFilterUpdate } = renderRankFilter({ filter });
    await openPanel(user);

    const count = screen.getByTestId('filter-widget-rank-count');
    await user.clear(count);
    await user.type(count, '9');
    await user.click(screen.getByTestId('filter-widget-panel-cancel'));

    expect(onFilterUpdate).not.toHaveBeenCalled();
    expect(screen.queryByTestId(PANEL)).not.toBeInTheDocument();
    await openPanel(user);
    expect(screen.getByTestId('filter-widget-rank-count')).toHaveValue('5');
  });

  it('publishes nothing on Escape', async () => {
    const user = userEvent.setup();
    const { onFilterUpdate } = renderRankFilter();
    await openPanel(user);

    await user.type(screen.getByTestId('filter-widget-rank-count'), '5');
    await user.keyboard('{Escape}');

    expect(onFilterUpdate).not.toHaveBeenCalled();
    expect(screen.queryByTestId(PANEL)).not.toBeInTheDocument();
  });

  it('publishes nothing on a click outside', async () => {
    const user = userEvent.setup();
    const { onFilterUpdate } = renderRankFilter();
    await openPanel(user);

    await user.type(screen.getByTestId('filter-widget-rank-count'), '5');
    await user.click(document.body);

    expect(onFilterUpdate).not.toHaveBeenCalled();
    expect(screen.queryByTestId(PANEL)).not.toBeInTheDocument();
  });

  it('resets the draft to the defaults on Clear, stays open and publishes nothing', async () => {
    const user = userEvent.setup();
    const { onFilterUpdate } = renderRankFilter({
      filter: filterFactory.bottomRanking(attribute, revenue, 7),
    });
    await openPanel(user);

    await user.click(screen.getByTestId('filter-widget-panel-clear'));

    expect(screen.getByTestId(PANEL)).toBeInTheDocument();
    expect(screen.getByTestId('filter-widget-rank-direction')).toHaveValue('Top');
    expect(screen.getByTestId('filter-widget-rank-count')).toHaveValue('10');
    expect(onFilterUpdate).not.toHaveBeenCalled();
  });

  it('publishes the default ranking when Clear is followed by Apply', async () => {
    const user = userEvent.setup();
    const { onFilterUpdate } = renderRankFilter({
      filter: filterFactory.bottomRanking(attribute, revenue, 7),
    });
    await openPanel(user);

    await user.click(screen.getByTestId('filter-widget-panel-clear'));
    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    expect(onFilterUpdate).toHaveBeenCalledTimes(1);
    expect(publishedFilter(onFilterUpdate).filterJaql()).toEqual({
      top: 10,
      by: revenue.jaql(true),
    });
  });

  it('keeps the identity of the filter it replaces', async () => {
    const user = userEvent.setup();
    const existing = filterFactory.topRanking(attribute, revenue, 5, { guid: 'rank-guid' });
    const { onFilterUpdate } = renderRankFilter({ filter: existing });
    await openPanel(user);

    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    expect(publishedFilter(onFilterUpdate).config.guid).toBe('rank-guid');
  });
});

describe('filter-widget-rank.unit:trigger-clear', () => {
  it('publishes include-all at once and returns to "Ranked by <field>"', async () => {
    const user = userEvent.setup();
    let applied: Filter | null = filterFactory.topRanking(attribute, revenue, 10);
    const onFilterUpdate = vi.fn((next: Filter | null) => {
      applied = next;
    });
    const { rerender } = render(
      <RankFilter
        attribute={attribute}
        rankBy={revenue}
        filter={applied}
        onFilterUpdate={onFilterUpdate}
      />,
    );
    expect(screen.getByTestId(TRIGGER)).toHaveValue('Top 10 By Weighted Revenue');

    await user.hover(getTriggerHoverTarget());
    // `fireEvent`, not `user.click`: user-event's pointer travel onto the ✕ drops the hover
    // that mounts it in jsdom, so the click never lands on the button the user sees.
    fireEvent.click(screen.getByTestId('filter-widget-select-clear'));

    expect(onFilterUpdate).toHaveBeenCalledTimes(1);
    expect(onFilterUpdate).toHaveBeenCalledWith(null);
    rerender(
      <RankFilter
        attribute={attribute}
        rankBy={revenue}
        filter={applied}
        onFilterUpdate={onFilterUpdate}
      />,
    );
    expect(screen.getByTestId(TRIGGER)).toHaveValue('Ranked by Weighted Revenue');
  });
});

describe('filter-widget-rank.unit:summary', () => {
  it('reads "Top N By <measure>" for an applied Top ranking', () => {
    renderRankFilter({ filter: filterFactory.topRanking(attribute, revenue, 10) });

    expect(screen.getByTestId(TRIGGER)).toHaveValue('Top 10 By Weighted Revenue');
  });

  it('reads "Bottom N By <measure>" for an applied Bottom ranking', () => {
    renderRankFilter({ filter: filterFactory.bottomRanking(attribute, revenue, 5) });

    expect(screen.getByTestId(TRIGGER)).toHaveValue('Bottom 5 By Weighted Revenue');
  });

  it('keeps the filtered date level out of the sentence', () => {
    renderRankFilter({
      attribute: Commerce.Date.Quarters,
      filter: filterFactory.topRanking(Commerce.Date.Quarters, revenue, 2),
    });

    expect(screen.getByTestId(TRIGGER)).toHaveValue('Top 2 By Weighted Revenue');
  });

  it('shows only the rule on hover, on two rows — `Top 10 By:` over the measure, no members', async () => {
    const user = userEvent.setup();
    renderRankFilter({ filter: filterFactory.topRanking(attribute, revenue, 10) });

    await user.hover(getTriggerHoverTarget());

    expect(hoverRows()).toEqual(['Top 10 By:', 'Weighted Revenue']);
  });
});

describe('filter-widget-rank.unit:hover-rows', () => {
  it('shows `Bottom N By:` over the measure for a Bottom ranking', async () => {
    const user = userEvent.setup();
    renderRankFilter({ filter: filterFactory.bottomRanking(attribute, revenue, 5) });

    await user.hover(getTriggerHoverTarget());

    expect(hoverRows()).toEqual(['Bottom 5 By:', 'Weighted Revenue']);
  });

  it('names a base measure the way the dashboard ranking tile does', async () => {
    const user = userEvent.setup();
    renderRankFilter({
      rankBy: measureFactory.countDistinct(Commerce.AgeRange),
      filter: filterFactory.topRanking(
        attribute,
        measureFactory.countDistinct(Commerce.AgeRange),
        8,
      ),
    });

    await user.hover(getTriggerHoverTarget());

    expect(screen.getByTestId(TRIGGER)).toHaveValue('Top 8 By # of unique Age Range');
    expect(hoverRows()).toEqual(['Top 8 By:', '# of unique Age Range']);
  });

  it('keeps the "choose a field" hint on a single row while no measure is set', async () => {
    const user = userEvent.setup();
    renderRankFilter({
      rankBy: undefined,
      filter: filterFactory.topRanking(attribute, revenue, 5),
    });

    await user.hover(getTriggerHoverTarget());

    expect(screen.getByTestId('filter-widget-select-tooltip')).toHaveTextContent(
      'Choose a field to rank by in: Filter Settings › Ranked by',
    );
  });
});

describe('filter-widget-rank.unit:viewer-readonly-ranked-by', () => {
  it('offers no way to change the Ranked by field from the panel', async () => {
    const user = userEvent.setup();
    renderRankFilter();
    await openPanel(user);

    const panel = screen.getByTestId(PANEL);
    const box = screen.getByTestId('filter-widget-rank-ranked-by');
    await user.click(box);

    expect(screen.queryByTestId('filter-widget-panel-back')).not.toBeInTheDocument();
    expect(within(panel).queryByText('Select field')).not.toBeInTheDocument();
    // On a text attribute the direction selector is the only drill-in the panel has.
    expect(within(panel).getAllByRole('combobox')).toHaveLength(1);
  });
});

describe('filter-widget-rank.unit:date-level', () => {
  it('publishes the ranking on the attribute at the picked level', async () => {
    const user = userEvent.setup();
    const { onFilterUpdate } = renderRankFilter({ attribute: dateAttribute });
    await openPanel(user);

    await user.click(screen.getByTestId('filter-widget-rank-grain'));
    await pickOption(user, 'Month');
    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    const filter = publishedFilter(onFilterUpdate);
    expect((filter.attribute as DimensionalLevelAttribute).granularity).toBe(DateLevels.Months);
    expect(filter.count).toBe(1);
  });

  it('offers the five levels of the regular ranking filter and no hour or minute levels', async () => {
    const user = userEvent.setup();
    renderRankFilter({ attribute: dateAttribute });
    await openPanel(user);

    await user.click(screen.getByTestId('filter-widget-rank-grain'));

    expect(
      screen.getAllByTestId('filter-widget-select-option').map((node) => node.textContent),
    ).toEqual(['Year', 'Quarter', 'Month', 'Week', 'Day']);
  });

  it('re-opens a datetime ranking on the level it was published at', async () => {
    const user = userEvent.setup();
    renderRankFilter({
      attribute: dateAttribute,
      filter: filterFactory.topRanking(Commerce.Date.Months, revenue, 3),
    });
    await openPanel(user);

    expect(screen.getByTestId('filter-widget-rank-grain')).toHaveValue('Month');
    expect(screen.getByTestId('filter-widget-rank-count')).toHaveValue('3');
  });
});

describe('filter-widget-rank.unit:keyboard', () => {
  it('names the direction and date level controls for assistive technology', async () => {
    const user = userEvent.setup();
    renderRankFilter({ attribute: dateAttribute });
    await openPanel(user);

    expect(screen.getByRole('combobox', { name: 'Ranking direction' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Select date level' })).toBeInTheDocument();
  });

  it('moves focus into the direction list and picks a row with the arrows and Enter', async () => {
    const user = userEvent.setup();
    const { onFilterUpdate } = renderRankFilter();
    await openPanel(user);

    screen.getByTestId('filter-widget-rank-direction').focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('group', { name: 'Ranking direction' })).toHaveFocus();

    await user.keyboard('{ArrowDown}{Enter}');

    expect(screen.getByTestId('filter-widget-rank-direction')).toHaveValue('Bottom');
    expect(onFilterUpdate).not.toHaveBeenCalled();
  });

  it('stops at the ends of the direction list and starts on the chosen row', async () => {
    const user = userEvent.setup();
    renderRankFilter({ filter: filterFactory.bottomRanking(attribute, revenue, 3) });
    await openPanel(user);

    screen.getByTestId('filter-widget-rank-direction').focus();
    await user.keyboard('{Enter}');
    const group = screen.getByRole('group', { name: 'Ranking direction' });
    const rows = within(group).getAllByRole('option');
    expect(group).toHaveAttribute('aria-activedescendant', expect.stringMatching(/-bottom$/));

    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(group).toHaveAttribute('aria-activedescendant', expect.stringMatching(/-bottom$/));
    await user.keyboard('{Home}');
    expect(group).toHaveAttribute('aria-activedescendant', expect.stringMatching(/-top$/));
    expect(rows.map((row) => row.textContent)).toEqual(['Top', 'Bottom']);
  });

  it('gives focus back to the trigger when Escape closes the panel', async () => {
    const user = userEvent.setup();
    const { onFilterUpdate } = renderRankFilter();
    await user.tab();
    expect(screen.getByTestId(TRIGGER)).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByTestId(PANEL)).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByTestId(PANEL)).not.toBeInTheDocument();
    expect(screen.getByTestId(TRIGGER)).toHaveFocus();
    expect(onFilterUpdate).not.toHaveBeenCalled();
  });

  it('gives focus back to the trigger when a keyboard Apply closes the panel from inside it', async () => {
    const user = userEvent.setup();
    const { onFilterUpdate } = renderRankFilter();
    await openPanel(user);
    act(() => screen.getByTestId('filter-widget-rank-count').focus());
    await user.keyboard('5');
    act(() => screen.getByTestId('filter-widget-panel-apply').focus());

    await user.keyboard('{Enter}');

    expect(screen.queryByTestId(PANEL)).not.toBeInTheDocument();
    expect(onFilterUpdate).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId(TRIGGER)).toHaveFocus();
  });

  it('does not pull focus to the trigger when Cancel is clicked after typing', async () => {
    const user = userEvent.setup();
    renderRankFilter();
    await openPanel(user);
    act(() => screen.getByTestId('filter-widget-rank-count').focus());
    await user.keyboard('5');

    await user.click(screen.getByTestId('filter-widget-panel-cancel'));

    expect(screen.queryByTestId(PANEL)).not.toBeInTheDocument();
    expect(screen.getByTestId(TRIGGER)).not.toHaveFocus();
  });

  it('leaves focus where it is when the panel closes with focus already elsewhere', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button data-testid="elsewhere" />
        <RankFilter attribute={attribute} rankBy={revenue} />
      </>,
    );
    await openPanel(user);
    act(() => screen.getByTestId('elsewhere').focus());

    await user.keyboard('{Escape}');

    expect(screen.queryByTestId(PANEL)).not.toBeInTheDocument();
    expect(screen.getByTestId('elsewhere')).toHaveFocus();
  });

  it('gives focus back to the trigger when Enter on Cancel closes the panel', async () => {
    const user = userEvent.setup();
    renderRankFilter();
    await openPanel(user);

    screen.getByTestId('filter-widget-panel-cancel').focus();
    await user.keyboard('{Enter}');

    expect(screen.queryByTestId(PANEL)).not.toBeInTheDocument();
    expect(screen.getByTestId(TRIGGER)).toHaveFocus();
  });

  // Typing is not a way out of the panel: a close that follows a digit, with no key that leaves it
  // and no pointer either, was not the user leaving by keyboard, so focus is theirs to keep.
  it('does not pull focus to the trigger when a close follows a key that is not an exit', async () => {
    const user = userEvent.setup();
    renderRankFilter();
    await openPanel(user);

    // Focus is in the panel, as it is for someone typing a count: opening it by click leaves it on
    // the trigger, which would make the assertion below true whatever the code does.
    const count = screen.getByTestId('filter-widget-rank-count');
    count.focus();
    fireEvent.keyDown(count, { key: '5' });
    fireEvent.click(screen.getByTestId('filter-widget-panel-cancel'));

    expect(screen.queryByTestId(PANEL)).not.toBeInTheDocument();
    expect(screen.getByTestId(TRIGGER)).not.toHaveFocus();
  });

  it('does not pull focus to the trigger when a click outside closes the panel', async () => {
    const user = userEvent.setup();
    renderRankFilter();
    await openPanel(user);

    await user.click(document.body);

    expect(screen.queryByTestId(PANEL)).not.toBeInTheDocument();
    expect(screen.getByTestId(TRIGGER)).not.toHaveFocus();
  });
});

describe('filter-widget-rank.unit:measure-removed-while-open', () => {
  // A parent can drop `rankBy` while the panel is open. Nothing is left to rank by, so the panel has
  // to go with the control locking: an Apply left behind could only publish an include-all and wipe
  // the ranking the dashboard holds.
  const rankedWith = (rankBy: typeof revenue | undefined, onFilterUpdate = vi.fn()) => (
    <RankFilter attribute={attribute} rankBy={rankBy} onFilterUpdate={onFilterUpdate} />
  );

  it('closes the panel without publishing when the measure goes away under it', async () => {
    const user = userEvent.setup();
    const onFilterUpdate = vi.fn();
    const { rerender } = render(rankedWith(revenue, onFilterUpdate));
    await openPanel(user);

    rerender(rankedWith(undefined, onFilterUpdate));

    expect(screen.queryByTestId(PANEL)).not.toBeInTheDocument();
    expect(onFilterUpdate).not.toHaveBeenCalled();
    expect(screen.getByTestId(TRIGGER)).toHaveAttribute('aria-disabled', 'true');
  });

  it('stays closed when the measure comes back', async () => {
    const user = userEvent.setup();
    const onFilterUpdate = vi.fn();
    const { rerender } = render(rankedWith(revenue, onFilterUpdate));
    await openPanel(user);

    rerender(rankedWith(undefined, onFilterUpdate));
    rerender(rankedWith(revenue, onFilterUpdate));

    expect(screen.queryByTestId(PANEL)).not.toBeInTheDocument();
    expect(onFilterUpdate).not.toHaveBeenCalled();
  });
});

describe('filter-widget-rank.unit:plain-datetime', () => {
  // A level control only makes sense where the host can follow it with a level change: an
  // attribute with no level has nowhere to move to, so offering one would be a choice that
  // changes nothing.
  const plainDate = createAttribute({
    name: 'Date',
    expression: '[Commerce.Date]',
    type: 'datetime',
  });

  it('offers no date level control on a datetime attribute that has no level', async () => {
    const user = userEvent.setup();
    renderRankFilter({ attribute: plainDate });

    await openPanel(user);

    expect(screen.queryByTestId('filter-widget-rank-grain')).not.toBeInTheDocument();
  });

  it('still opens it on Top 1 and ranks the attribute itself on Apply', async () => {
    const user = userEvent.setup();
    const { onFilterUpdate } = renderRankFilter({ attribute: plainDate });

    await openPanel(user);
    expect(screen.getByTestId('filter-widget-rank-count')).toHaveValue('1');
    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    expect(publishedFilter(onFilterUpdate).attribute).toBe(plainDate);
  });
});

/* eslint-disable @typescript-eslint/no-unsafe-return */

/* eslint-disable @typescript-eslint/no-unsafe-argument */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  DateLevels,
  DimensionalLevelAttribute,
  filterFactory,
  RelativeDateFilter,
} from '@sisense/sdk-data';
import { render, screen } from '@testing-library/react';
import dayjs from 'dayjs';

import { MockedSisenseContextProvider, setup } from '../../../../../__test-helpers__/index.js';
import { FilterVariant } from '../../common/index.js';
import { DEFAULT_FORMAT } from '../consts.js';
import { RelativeDateFilterTile } from './relative-date-filter-tile.js';

describe('RelativeDateFilterTile tests', () => {
  const mockAttributeDays = new DimensionalLevelAttribute(
    DateLevels.Days,
    '[Commerce.Date (Calendar)]',
    DateLevels.Days,
  );
  const mockAttributeYears = new DimensionalLevelAttribute(
    'Years',
    '[Commerce.Date (Calendar)]',
    DateLevels.Years,
  );
  it('should render collapsed display text by default when vertical', () => {
    const props = {
      title: 'Test Title',
      filter: filterFactory.dateRelativeTo(mockAttributeDays, 0, 2) as RelativeDateFilter,
      arrangement: 'vertical' as FilterVariant,
      onUpdate: vi.fn(),
    };
    render(
      <MockedSisenseContextProvider>
        <RelativeDateFilterTile {...props} />
      </MockedSisenseContextProvider>,
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    const displayText = `Last 2 Days From Today`;
    expect(screen.getByText(displayText)).toBeInTheDocument();
  });
  it('should render input fields when vertical and expanded', async () => {
    const props = {
      title: 'Test Title',
      filter: filterFactory.dateRelativeTo(mockAttributeDays, 0, 2) as RelativeDateFilter,
      arrangement: 'vertical' as FilterVariant,
      onUpdate: vi.fn(),
    };
    const { user } = setup(
      <MockedSisenseContextProvider>
        <RelativeDateFilterTile {...props} />
      </MockedSisenseContextProvider>,
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    const displayText = `Last 2 Days From Today`;
    const displayTextElt = screen.getByText(displayText);
    expect(displayTextElt).toBeInTheDocument();
    await user.click(screen.getByLabelText('arrow-down'));
    expect(displayTextElt).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
    expect(screen.getByText(dayjs().format(DEFAULT_FORMAT))).toBeInTheDocument();
  });
  it('should render input fields when horizontal', async () => {
    const props = {
      title: 'Test Title',
      filter: filterFactory.dateRelativeFrom(mockAttributeYears, 0, 1) as RelativeDateFilter,
      onUpdate: vi.fn(),
    };
    const { user } = setup(
      <MockedSisenseContextProvider>
        <RelativeDateFilterTile {...props} />
      </MockedSisenseContextProvider>,
    );
    const dropdown = screen.getByText('Next');
    expect(dropdown).toBeInTheDocument();
    expect(screen.getByDisplayValue('1')).toBeInTheDocument();
    expect(screen.getByText('Years')).toBeInTheDocument();
    expect(screen.getByText('From')).toBeInTheDocument();
    const dateField = screen.getByText(dayjs().format(DEFAULT_FORMAT));
    expect(dateField).toBeInTheDocument();

    await user.click(dropdown);
    const menu = screen.getByRole('menu');
    expect(menu).toBeInTheDocument();
    const last = screen.getByText('Last');
    expect(last).toBeInTheDocument();

    await user.click(last);
    expect(props.onUpdate).toHaveBeenCalled();
    expect(menu).not.toBeInTheDocument();

    await user.click(dateField);
    const calendarDay = screen.getByText('20');
    expect(calendarDay).toBeInTheDocument();

    await user.click(calendarDay);
    expect(props.onUpdate).toHaveBeenCalled();
    expect(calendarDay).not.toBeInTheDocument();
  });

  it('should give the count input a minimum width', () => {
    const props = {
      title: 'Test Title',
      filter: filterFactory.dateRelativeTo(mockAttributeDays, 0, 2) as RelativeDateFilter,
      arrangement: 'horizontal' as FilterVariant,
      onUpdate: vi.fn(),
    };
    render(
      <MockedSisenseContextProvider>
        <RelativeDateFilterTile {...props} />
      </MockedSisenseContextProvider>,
    );
    expect(screen.getByDisplayValue('2')).toHaveStyle({ minWidth: '60px' });
  });

  it('should not have delete button by default', async () => {
    const props = {
      title: 'Test Title',
      filter: filterFactory.dateRelativeTo(mockAttributeDays, 0, 2) as RelativeDateFilter,
      arrangement: 'vertical' as FilterVariant,
      onUpdate: vi.fn(),
    };
    const { queryByTestId } = render(
      <MockedSisenseContextProvider>
        <RelativeDateFilterTile {...props} />
      </MockedSisenseContextProvider>,
    );
    const deleteButton = queryByTestId('filter-delete-button');
    expect(deleteButton).not.toBeInTheDocument();
  });

  it('should have delete button if onDelete is provided', async () => {
    const props = {
      title: 'Test Title',
      filter: filterFactory.dateRelativeTo(mockAttributeDays, 0, 2) as RelativeDateFilter,
      arrangement: 'vertical' as FilterVariant,
      onUpdate: vi.fn(),
    };
    const { findByTestId } = render(
      <MockedSisenseContextProvider>
        <RelativeDateFilterTile {...props} onDelete={() => {}} />
      </MockedSisenseContextProvider>,
    );
    const deleteButton = await findByTestId('filter-delete-button');
    expect(deleteButton).toBeInTheDocument();
  });

  it('should call onDelete when delete button is clicked', async () => {
    const props = {
      title: 'Test Title',
      filter: filterFactory.dateRelativeTo(mockAttributeDays, 0, 2) as RelativeDateFilter,
      arrangement: 'vertical' as FilterVariant,
      onUpdate: vi.fn(),
    };
    const onDelete = vi.fn();
    const { findByTestId } = render(
      <MockedSisenseContextProvider>
        <RelativeDateFilterTile {...props} onDelete={onDelete} />
      </MockedSisenseContextProvider>,
    );
    const deleteButton = await findByTestId('filter-delete-button');
    deleteButton.click();
    expect(onDelete).toHaveBeenCalled();
  });

  it('should call "onEdit" when edit button is clicked', async () => {
    const props = {
      title: 'Test Title',
      filter: filterFactory.dateRelativeTo(mockAttributeDays, 0, 2) as RelativeDateFilter,
      arrangement: 'vertical' as FilterVariant,
      onUpdate: vi.fn(),
    };
    const onEditMock = vi.fn();
    const { findByTestId } = render(
      <MockedSisenseContextProvider>
        <RelativeDateFilterTile {...props} onEdit={onEditMock} />
      </MockedSisenseContextProvider>,
    );
    const editButton = await findByTestId('filter-edit-button');
    editButton.click();
    expect(onEditMock).toHaveBeenCalled();
  });

  it('shows menu in tile when lock action is enabled in config', async () => {
    const props = {
      title: 'Test Title',
      filter: filterFactory.dateRelativeTo(mockAttributeDays, 0, 2) as RelativeDateFilter,
      arrangement: 'vertical' as FilterVariant,
      onUpdate: vi.fn(),
    };
    const config = { actions: { lockFilter: { enabled: true } } };
    render(
      <MockedSisenseContextProvider>
        <RelativeDateFilterTile {...props} config={config} />
      </MockedSisenseContextProvider>,
    );
    expect(await screen.findByLabelText('Filter tile menu')).toBeInTheDocument();
  });

  it('renders linked indicator and disables controls when linked to a FilterWidget', async () => {
    const props = {
      title: 'Test Title',
      filter: filterFactory.dateRelativeTo(mockAttributeDays, 0, 2) as RelativeDateFilter,
      arrangement: 'vertical' as FilterVariant,
      onUpdate: vi.fn(),
      onDelete: vi.fn(),
    };
    render(
      <MockedSisenseContextProvider>
        <RelativeDateFilterTile {...props} linked />
      </MockedSisenseContextProvider>,
    );

    expect(await screen.findByTestId('filter-tile-linked-indicator')).toBeInTheDocument();
    expect(screen.getByTestId('filter-delete-button')).toBeDisabled();
    expect(screen.getByRole('switch', { name: 'Enable/disable filter' })).toBeDisabled();
    // The expand toggle is disabled too — a linked VERTICAL tile can never reach its own
    // editable controls through the collapsed display (gated by `FilterTileContainer`'s own
    // `disabled={linked}` on the arrow). Horizontal arrangement has no such gate — the
    // editable controls render unconditionally — which is what the next test exercises.
    expect(screen.getByRole('button', { name: 'arrow-down' })).toBeDisabled();
  });

  it('disables the editable count/level/anchor-date controls when linked to a FilterWidget (horizontal — no collapse gate)', async () => {
    const props = {
      title: 'Test Title',
      filter: filterFactory.dateRelativeTo(mockAttributeDays, 0, 2) as RelativeDateFilter,
      arrangement: 'horizontal' as FilterVariant,
      onUpdate: vi.fn(),
      onDelete: vi.fn(),
    };
    render(
      <MockedSisenseContextProvider>
        <RelativeDateFilterTile {...props} linked />
      </MockedSisenseContextProvider>,
    );

    // CodeRabbit review finding: `renderContent` always shows the editable
    // `RelativeDateFilter` for horizontal arrangement (nothing to collapse), so this was the
    // one place a linked filter's count/level/anchor-date controls stayed genuinely
    // reachable and editable — they were wired to `filter.config.disabled` alone, ignoring
    // `linked`.
    expect(await screen.findByDisplayValue('2')).toBeDisabled();
    expect(screen.getByLabelText('DateRangeFieldButton')).toBeDisabled();
  });
});

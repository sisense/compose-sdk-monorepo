/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  DateLevels,
  DimensionalLevelAttribute,
  RelativeDateFilter,
  filterFactory,
} from '@ethings-os/sdk-data';
import { RelativeDateFilterTile } from './relative-date-filter-tile.js';
import { MockedSisenseContextProvider, setup } from '../../../../__test-helpers__/index.js';
import { render, screen } from '@testing-library/react';
import { FilterVariant } from '../../common/index.js';
import { DEFAULT_FORMAT } from '../consts.js';
import dayjs from 'dayjs';

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
    const displayText = `dateFilter.last 2 dateFilter.days dateFilter.from dateFilter.today`;
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
    const displayText = `dateFilter.last 2 dateFilter.days dateFilter.from dateFilter.today`;
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
    const dropdown = screen.getByText('dateFilter.next');
    expect(dropdown).toBeInTheDocument();
    expect(screen.getByDisplayValue('1')).toBeInTheDocument();
    expect(screen.getByText('dateFilter.years')).toBeInTheDocument();
    expect(screen.getByText('dateFilter.from')).toBeInTheDocument();
    const dateField = screen.getByText(dayjs().format(DEFAULT_FORMAT));
    expect(dateField).toBeInTheDocument();

    await user.click(dropdown);
    const menu = screen.getByRole('menu');
    expect(menu).toBeInTheDocument();
    const last = screen.getByText('dateFilter.last');
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
});

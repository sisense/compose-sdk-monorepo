/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { setup } from '@/__test-helpers__';
import { screen, waitFor } from '@testing-library/react';
import { DateFilter, DateRangeFilterProps } from './date-filter';

describe('DateFilter Component', () => {
  const mockOnChange = vi.fn();

  const defaultProps: DateRangeFilterProps = {
    onChange: mockOnChange,
    value: { from: '2022-01-01', to: '2022-01-15' },
    limit: { minDate: '2021-12-01', maxDate: '2022-02-28' },
    isDependent: false,
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render "DateFilter" component correctly', async () => {
    const { findByText } = setup(<DateFilter {...defaultProps} />);

    // Ensure the "From" and "To" fields are rendered
    expect(await findByText('From')).toBeInTheDocument();
    expect(await findByText('To')).toBeInTheDocument();
  });

  it('should render dependent "DateFilter" component', () => {
    const props = { ...defaultProps, isDependent: true };
    const { getByTestId } = setup(<DateFilter {...props} />);

    expect(getByTestId('triangle-indicator')).toBeInTheDocument();
  });

  it('should open date range selector popover when clicking "From" field', async () => {
    const { user } = setup(<DateFilter {...defaultProps} />);

    // Click the "From" field to open the date range selector
    await user.click(screen.getByText('2022-01-01'));

    // Ensure the date range selector popover is open by searching for expected text presented on it
    await waitFor(() => expect(screen.getByText('Jan 2022')).toBeInTheDocument());
  });

  it('should call "onChange" callback with updated date', async () => {
    const { user } = setup(<DateFilter {...defaultProps} />);
    const fromButton = screen.getByText(defaultProps.value.from!);
    const toButton = screen.getByText(defaultProps.value.to!);

    await user.click(fromButton);

    // Ensure the date range selector popover is open by searching for expected text presented on it
    await waitFor(() => expect(screen.getByText('Jan 2022')).toBeInTheDocument());

    // Selects new 'from' date -> '2022-01-12'
    await user.click(screen.getByText('12'));

    await user.click(toButton);

    await waitFor(() => expect(screen.getByText('Jan 2022')).toBeInTheDocument());

    // Selects new 'to' date -> '2022-01-14'
    await user.click(screen.getByText('16'));

    await waitFor(() => expect(mockOnChange).toHaveBeenCalledTimes(2));

    expect(mockOnChange.mock.calls[0][0].filter.from).toBe('2022-01-12');
    expect(mockOnChange.mock.calls[1][0].filter.to).toBe('2022-01-16');
  });

  it('should change current calendar year/month', async () => {
    const { user } = setup(<DateFilter {...defaultProps} />);
    const fromButton = screen.getByText(defaultProps.value.from!);

    await user.click(fromButton);

    await waitFor(() => expect(screen.getByText('Jan 2022')).toBeInTheDocument());

    const [leftYearButton, leftMonthButton, rightMonthButton, rightYearButton] = Array.from(
      document.querySelectorAll('.react-datepicker__header button'),
    );

    // switch to 2021 year
    await user.click(leftYearButton);
    await waitFor(() => expect(screen.getByText('Jan 2021')).toBeInTheDocument());

    // switch to 2022 year
    await user.click(rightYearButton);
    await waitFor(() => expect(screen.getByText('Jan 2022')).toBeInTheDocument());

    // switch to Feb month
    await user.click(rightMonthButton);
    await waitFor(() => expect(screen.getByText('Feb 2022')).toBeInTheDocument());

    // switch to Jan month
    await user.click(leftMonthButton);
    await waitFor(() => expect(screen.getByText('Jan 2022')).toBeInTheDocument());
  });
});

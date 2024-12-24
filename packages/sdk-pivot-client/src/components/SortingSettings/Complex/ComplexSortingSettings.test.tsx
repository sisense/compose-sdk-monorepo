import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ComplexSortingSettingsPopup,
  type ComplexSortingSettingsPopupProps,
} from './ComplexSortingSettings';

import '@testing-library/jest-dom';

describe('ComplexSortingSettingsPopup', () => {
  let props: ComplexSortingSettingsPopupProps;

  beforeEach(() => {
    props = {
      titleOfPopUp: ['Sort Settings'],
      currentSortingSettings: [
        { title: 'Field A', selected: true, direction: 'asc', datatype: 'text' },
        { title: 'Field B', selected: false, direction: null, datatype: 'numeric' },
      ],
      onSortingSettingsUpdate: vi.fn(),
      onCrossIconClick: vi.fn(),
      messages: {
        clearSorting: 'Clear Sorting',
        selectToSort: 'Select fields to sort by',
        sortBy: 'Sort by',
        sort: 'Sort',
        subtotals: 'Subtotals',
        apply: 'Apply',
        cancel: 'Cancel',
        ascAZ: 'A-Z',
        descZA: 'Z-A',
        asc19: '1-9',
        desc91: '9-1',
      },
    };
  });

  it('should render the DEPRECATED_Button for clear sorting', () => {
    render(<ComplexSortingSettingsPopup {...props} />);

    const clearSortingButton = screen.getByText('Clear Sorting');

    expect(clearSortingButton).toBeInTheDocument();
  });

  it('should render the DEPRECATED_Button to apply sorting', () => {
    render(<ComplexSortingSettingsPopup {...props} />);

    const applyButton = screen.getByText('Apply');

    expect(applyButton).toBeInTheDocument();
  });

  it('should render the DEPRECATED_Button for clear sorting and triggers when its onClick', () => {
    render(<ComplexSortingSettingsPopup {...props} />);
    const clearSortingButton = screen.getByText('Clear Sorting');

    fireEvent.click(clearSortingButton);

    expect(props.onSortingSettingsUpdate).toHaveBeenCalledWith(
      props.currentSortingSettings.map((item) => ({ ...item, direction: null, selected: false })),
    );
  });

  it('should render the DEPRECATED_Button for apply and triggers when its onClick', () => {
    render(<ComplexSortingSettingsPopup {...props} />);
    const applyButton = screen.getByText('Apply');

    fireEvent.click(applyButton);

    expect(props.onSortingSettingsUpdate).toHaveBeenCalledWith(props.currentSortingSettings);
  });

  it('should call onSortingSettingsUpdate when settings changed and applied', () => {
    render(<ComplexSortingSettingsPopup {...props} />);

    const toggleButton = screen.getByText('Field A');
    fireEvent.click(toggleButton);
    const applyButton = screen.getByText('Apply');
    fireEvent.click(applyButton);

    expect(props.onSortingSettingsUpdate).toHaveBeenCalled();
  });

  it('should call onSortingSettingsUpdate when settings changed and applied with correct values', () => {
    render(<ComplexSortingSettingsPopup {...props} />);

    const toggleButton = screen.getByText('Field A');
    fireEvent.click(toggleButton);
    const applyButton = screen.getByText('Apply');
    fireEvent.click(applyButton);

    expect(props.onSortingSettingsUpdate).toHaveBeenCalledWith([
      {
        datatype: 'text',
        direction: null,
        selected: false,
        title: 'Field A',
      },
      {
        datatype: 'numeric',
        direction: null,
        selected: false,
        title: 'Field B',
      },
    ]);
  });

  it('should render the header with the correct title', () => {
    render(<ComplexSortingSettingsPopup {...props} />);

    const sortByButton = screen.getByText('Sort by');

    expect(sortByButton).toBeInTheDocument(); // Ensure it's rendered
  });

  it('should render the sorting text correctly', () => {
    render(<ComplexSortingSettingsPopup {...props} />);

    expect(screen.getByText('Select fields to sort by')).toBeInTheDocument();
  });

  it('should render the subtotals text correctly', () => {
    render(<ComplexSortingSettingsPopup {...props} />);

    expect(screen.getByText('Subtotals')).toBeInTheDocument();
  });

  it('should call onCrossIconClick when clicked one time', () => {
    const { container } = render(<ComplexSortingSettingsPopup {...props} />);

    const icon = container.querySelector(`.app-icon.app-icon--general-x.cross-icon`) as Element;
    fireEvent.click(icon);

    expect(props.onCrossIconClick).toHaveBeenCalledTimes(1);
  });
});

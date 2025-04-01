import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { AddFilterPopover } from '@/data-browser/add-filter-popover/add-filter-popover';

// Create a dummy anchor element for the popover.
const dummyAnchor = document.createElement('div');
dummyAnchor.setAttribute('data-testid', 'anchor');

const sampleDataSource = 'Sample DataSource';
const dataSources = [sampleDataSource];

const onCloseMock = vi.fn();
const onFilterCreatedMock = vi.fn();

// Replace the AddFilterDataBrowser with a dummy component that renders a button.
// When the button is clicked, it calls its onAttributeClick prop with a sample attribute.
vi.mock('@/data-browser/add-filter-popover/add-filter-data-browser', () => {
  return {
    AddFilterDataBrowser: (props: any) => (
      <div data-testid="add-filter-data-browser">
        <button onClick={() => props.onAttributeClick({ type: 'test', name: 'TestAttribute' })}>
          Click Me
        </button>
      </div>
    ),
  };
});

describe('AddFilterPopover component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render Popover with header and AddFilterDataBrowser when open', () => {
    const { getByText, getByTestId } = render(
      <AddFilterPopover
        anchorEl={dummyAnchor}
        isOpen={true}
        onClose={onCloseMock}
        dataSources={dataSources}
        initialDataSource={sampleDataSource}
        onFilterCreated={onFilterCreatedMock}
      />,
    );

    // Header text should be rendered.
    expect(getByText('dataBrowser.addFilter')).toBeTruthy();
    // Flow path text should be rendered.
    expect(getByText('dataBrowser.selectField')).toBeTruthy();
    // Mocked AddFilterDataBrowser should be rendered.
    expect(getByTestId('add-filter-data-browser')).toBeTruthy();
  });

  it('should call onFilterCreated when attribute is clicked in AddFilterDataBrowser', () => {
    const { getByTestId } = render(
      <AddFilterPopover
        anchorEl={dummyAnchor}
        isOpen={true}
        onClose={onCloseMock}
        dataSources={dataSources}
        initialDataSource={sampleDataSource}
        onFilterCreated={onFilterCreatedMock}
      />,
    );

    // Simulate a click on the button inside the mocked AddFilterDataBrowser.
    const button = getByTestId('add-filter-data-browser').querySelector('button');
    expect(button).toBeTruthy();
    if (button) {
      fireEvent.click(button);
    }

    // onFilterCreated is called.
    expect(onFilterCreatedMock).toHaveBeenCalledTimes(1);

    // Check that it creates empty member filter.
    const createdFilter = onFilterCreatedMock.mock.calls[0][0];
    expect(createdFilter).toHaveProperty('members');
    expect(createdFilter.members).toEqual([]);
  });

  it('should call onClose when Popover is closed by clicking on the close button', () => {
    const { getByTestId } = render(
      <AddFilterPopover
        anchorEl={dummyAnchor}
        isOpen={true}
        onClose={onCloseMock}
        dataSources={dataSources}
        initialDataSource={sampleDataSource}
        onFilterCreated={onFilterCreatedMock}
      />,
    );

    // Simulate a click on the close button.
    const closeButton = getByTestId('popover-close-button');
    fireEvent.click(closeButton);

    // onClose is called.
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('should not render Popover content when isOpen is false', () => {
    const { queryByTestId, container } = render(
      <AddFilterPopover
        anchorEl={dummyAnchor}
        isOpen={false}
        onClose={onCloseMock}
        dataSources={dataSources}
        initialDataSource={sampleDataSource}
        onFilterCreated={onFilterCreatedMock}
      />,
    );

    // AddFilterDataBrowser shouldn't be rendered.
    expect(queryByTestId('add-filter-data-browser')).toBeNull();
    expect(container.firstChild).toBeNull();
  });
});

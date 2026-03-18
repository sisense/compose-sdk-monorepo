import { fireEvent, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AddMeasurePopover } from '@/domains/data-browser/add-measure-popover/add-measure-popover';

const dummyAnchor = document.createElement('div');
dummyAnchor.setAttribute('data-testid', 'anchor');

const sampleDataSource = 'Sample DataSource';
const dataSources = [sampleDataSource];

const onCloseMock = vi.fn();
const onMeasureCreatedMock = vi.fn();

vi.mock('@/domains/data-browser/add-measure-popover/add-measure-data-browser', () => ({
  AddMeasureDataBrowser: (props: { onMeasureCreated: (measure: unknown) => void }) => (
    <div data-testid="add-measure-data-browser">
      <button
        onClick={() =>
          props.onMeasureCreated({
            aggregation: 'sum',
            attribute: { name: 'Revenue' },
          })
        }
      >
        Create Measure
      </button>
    </div>
  ),
}));

describe('AddMeasurePopover component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render Popover with header and AddMeasureDataBrowser when open', () => {
    const { getByText, getByTestId } = render(
      <AddMeasurePopover
        anchorEl={dummyAnchor}
        isOpen={true}
        onClose={onCloseMock}
        dataSources={dataSources}
        initialDataSource={sampleDataSource}
        onMeasureCreated={onMeasureCreatedMock}
      />,
    );

    expect(getByText('dataBrowser.addMeasure')).toBeTruthy();
    expect(getByText('dataBrowser.selectField')).toBeTruthy();
    expect(getByTestId('add-measure-data-browser')).toBeTruthy();
  });

  it('should call onMeasureCreated when measure is created in AddMeasureDataBrowser', () => {
    const { getByTestId } = render(
      <AddMeasurePopover
        anchorEl={dummyAnchor}
        isOpen={true}
        onClose={onCloseMock}
        dataSources={dataSources}
        initialDataSource={sampleDataSource}
        onMeasureCreated={onMeasureCreatedMock}
      />,
    );

    const button = getByTestId('add-measure-data-browser').querySelector('button');
    expect(button).toBeTruthy();
    if (button) {
      fireEvent.click(button);
    }

    expect(onMeasureCreatedMock).toHaveBeenCalledTimes(1);
    const createdMeasure = onMeasureCreatedMock.mock.calls[0][0];
    expect(createdMeasure).toHaveProperty('aggregation', 'sum');
    expect(createdMeasure).toHaveProperty('attribute');
  });

  it('should call onClose when Popover is closed by clicking the close button', () => {
    const { getByTestId } = render(
      <AddMeasurePopover
        anchorEl={dummyAnchor}
        isOpen={true}
        onClose={onCloseMock}
        dataSources={dataSources}
        initialDataSource={sampleDataSource}
        onMeasureCreated={onMeasureCreatedMock}
      />,
    );

    const closeButton = getByTestId('popover-close-button');
    fireEvent.click(closeButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('should not render Popover content when isOpen is false', () => {
    const { queryByTestId, container } = render(
      <AddMeasurePopover
        anchorEl={dummyAnchor}
        isOpen={false}
        onClose={onCloseMock}
        dataSources={dataSources}
        initialDataSource={sampleDataSource}
        onMeasureCreated={onMeasureCreatedMock}
      />,
    );

    expect(queryByTestId('add-measure-data-browser')).toBeNull();
    expect(container.firstChild).toBeNull();
  });

  it('should not render AddMeasureDataBrowser when dataSources is empty', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { queryByTestId } = render(
      <AddMeasurePopover
        anchorEl={dummyAnchor}
        isOpen={true}
        onClose={onCloseMock}
        dataSources={[]}
        initialDataSource={sampleDataSource}
        onMeasureCreated={onMeasureCreatedMock}
      />,
    );

    // Error boundary catches the thrown error; AddMeasureDataBrowser is never rendered
    expect(queryByTestId('add-measure-data-browser')).toBeNull();

    consoleSpy.mockRestore();
  });
});

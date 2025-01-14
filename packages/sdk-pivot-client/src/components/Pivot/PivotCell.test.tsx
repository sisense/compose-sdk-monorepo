import { render, screen } from '@testing-library/react';

import PivotCell, { PivotCellProps } from './PivotCell';
import * as helpers from '../PivotCell/helpers';
import { PivotTreeNode } from '../../data-handling';
import { TreeNodeMetadata } from '../../tree-structure/types';

const TEXT_CONTENT: string = 'test content';

describe('PivotCell Component', () => {
  const defaultState = {
    cellPadding: 0,
    isDrilled: false,
    isSelected: false,
    sortIconShouldBeVisible: false,
    sortingPopup: null,
    merge: {},
    isEmbedImage: false,
    toolTipText: '',
  };

  const defaultProps: PivotCellProps = {
    isDataCell: true,
    treeNode: { value: TEXT_CONTENT },
    measure: () => {},
    rowIndex: 1,
    columnIndex: 1,
    fixedWidth: false,
    tdComponent: 'td',
    styleObj: {},
    onSortingSettingsChanged: (
      treeNode: PivotTreeNode | undefined,
      metadata: TreeNodeMetadata | undefined,
      cell: PivotCell,
    ) => {},
  };

  const pivotCell = <PivotCell {...defaultProps} />;
  const setStateSpy = vi.spyOn(PivotCell.prototype, 'setState');
  let getTooltip = vi.spyOn(helpers, 'getTooltip');

  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 100 });
  });

  beforeEach(() => {
    getTooltip = vi.spyOn(helpers, 'getTooltip');
  });

  test('getTooltip should not be called', () => {
    const { rerender } = render(pivotCell);
    expect(getTooltip).not.toHaveBeenCalled();
    rerender(<PivotCell {...defaultProps} />);
    expect(getTooltip).not.toHaveBeenCalled();
  });

  test('getTooltip should be called twice but not change tooltip', () => {
    const { rerender } = render(pivotCell);
    const contentElement = screen.getByTestId('cell-content');
    Object.defineProperty(contentElement, 'offsetWidth', { configurable: true, value: 10 });

    rerender(<PivotCell {...defaultProps} isDataCell={false} />);
    expect(getTooltip).toHaveBeenCalledOnce();
    expect(setStateSpy).not.toHaveBeenCalledWith({
      ...defaultState,
      toolTipText: TEXT_CONTENT,
    });
  });

  test('getTooltip should be called twice and change tooltip to the text content', () => {
    const { rerender } = render(pivotCell);

    const contentElement = screen.getByTestId('cell-content');
    Object.defineProperty(contentElement, 'offsetWidth', { configurable: true, value: 500 });
    rerender(<PivotCell {...defaultProps} isDataCell={false} />);
    expect(getTooltip).toHaveBeenCalledTimes(2);
    expect(setStateSpy).toHaveBeenCalledWith({
      ...defaultState,
      toolTipText: TEXT_CONTENT,
    });
  });
});

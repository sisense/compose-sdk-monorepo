/* eslint-disable react/no-array-index-key */
import * as React from 'react';
import { AnchorCell } from './AnchorCell.js';
import { TableSize } from '../../sizing/index.js';
import { TABLE, COLGROUP, COLUMN, TBODY, ROW } from './classes.js';
import { SizeMap } from './types.js';
import { Styles } from '../../utils/types.js';
import { TreeServiceI } from '../../tree-structure/types.js';

export type CellRenderProps = {
  clone: boolean;
  rowIndex: number;
  colIndex: number;
  rowHeight: number | undefined;
  colWidth: number | undefined;
  borderWidth: number;
  type: string;
  isMobile?: boolean;
};

type Props = {
  clone: boolean;
  className?: string;
  type: string;
  zoomRatio?: number;
  widths: SizeMap;
  heights: SizeMap;
  borderWidth: number;
  borderColor?: string;
  rowsCount: number;
  colsCount: number;
  tableSize: TableSize;
  rowsTreeService?: TreeServiceI;
  columnsTreeService?: TreeServiceI;
  cornerTreeService?: TreeServiceI;
  cellRenderer: (props: CellRenderProps) => React.ReactElement | null;
  onGridUpdated?: () => void;
  isMobile?: boolean;
};

type State = {};

export class PivotInnerTable extends React.PureComponent<Props, State> {
  tableStyles?: Styles | null;

  static defaultProps = {
    clone: false,
    borderWidth: 1,
    borderColor: '',
  };

  UNSAFE_componentWillReceiveProps(nextProps: Readonly<Props>): void {
    if (nextProps.borderColor !== this.props.borderColor) {
      this.tableStyles = undefined;
    }
  }

  componentDidUpdate(): void {
    if (this.props.onGridUpdated) {
      this.props.onGridUpdated();
    }
  }

  getTableStyles() {
    if (this.tableStyles === undefined) {
      if (this.props.borderColor) {
        this.tableStyles = {
          borderColor: this.props.borderColor,
        };
      } else {
        this.tableStyles = null;
      }
    }
    return this.tableStyles;
  }

  // eslint-disable-next-line class-methods-use-this
  getColumns(colsCount = 10): Array<React.ReactElement> {
    return Array.from(Array(colsCount + 1)).map((c, index) => (
      <col key={`col-${index}`} className={`${COLUMN} ${COLUMN}-${index}`} />
    ));
  }

  getRows(rowsCount = 10, cellsCount = 10, widths: SizeMap, heights: SizeMap): React.ReactElement {
    const { clone, borderWidth } = this.props;
    return (
      <>
        {Array.from(Array(rowsCount)).map((c, index) => {
          const rowHeight = heights[index];
          return this.getRow(cellsCount, index, rowHeight, widths);
        })}
        {!clone ? (
          <tr className={ROW} key="anchor" style={{ height: 0 }}>
            {Array.from(Array(cellsCount + 1)).map((c, index) => {
              const colWidth = widths[index];
              return (
                <AnchorCell
                  key={`anchor-${index}`}
                  type={AnchorCell.type.COL}
                  colIndex={index}
                  tableSize={this.props.tableSize}
                  width={colWidth}
                  borderWidth={borderWidth}
                />
              );
            })}
          </tr>
        ) : null}
      </>
    );
  }

  getRow(
    cellsCount = 10,
    rowIndex = 0,
    rowHeight: number | undefined,
    widths: SizeMap,
  ): React.ReactElement {
    const { clone, borderWidth } = this.props;
    const height = clone && typeof rowHeight === 'number' ? rowHeight : 'auto';
    return (
      <tr key={rowIndex} className={`${ROW} ${ROW}-${rowIndex}`} style={{ height }}>
        {Array.from(Array(cellsCount)).map((c, index) => {
          const colWidth = widths[index];
          return this.getCell({
            rowHeight,
            colWidth,
            rowIndex,
            colIndex: index,
          });
        })}
        {!clone ? (
          <AnchorCell
            type={AnchorCell.type.ROW}
            rowIndex={rowIndex}
            tableSize={this.props.tableSize}
            height={rowHeight}
            borderWidth={borderWidth}
          />
        ) : null}
      </tr>
    );
  }

  getCell(props: { rowHeight?: number; colWidth?: number; rowIndex: number; colIndex: number }) {
    // console.log('getCell', props);
    const { rowIndex, colIndex, rowHeight, colWidth } = props || {};
    const { clone, type, cellRenderer, borderWidth, isMobile } = this.props;

    return cellRenderer({
      rowIndex,
      colIndex,
      rowHeight,
      colWidth,
      borderWidth,
      clone,
      type,
      isMobile,
    });
  }

  render() {
    const { widths, heights, colsCount, rowsCount, className } = this.props;

    const tableStyle = this.getTableStyles() || undefined;

    return (
      <table className={`${TABLE} ${className}`} style={tableStyle}>
        <colgroup className={COLGROUP}>{this.getColumns(colsCount)}</colgroup>
        <tbody className={TBODY}>{this.getRows(rowsCount, colsCount, widths, heights)}</tbody>
      </table>
    );
  }
}

export default PivotInnerTable;

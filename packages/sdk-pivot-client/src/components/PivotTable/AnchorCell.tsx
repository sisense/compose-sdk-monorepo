import * as React from 'react';

import { EVENT_NOTIFY_SIZE, TableSize } from '../../sizing/index.js';

type Props = {
  type: string;
  rowIndex?: number;
  colIndex?: number;
  tableSize: TableSize;
  width?: number;
  height?: number;
  borderWidth: number;
};

type State = {};

export class AnchorCell extends React.PureComponent<Props, State> {
  height = 0;

  width = 0;

  content?: HTMLDivElement;

  tdElement?: HTMLTableCellElement;

  cellStyle: React.CSSProperties;

  contentStyle: React.CSSProperties;

  constructor(props: Props) {
    super(props);

    this.contentStyle = {};
    if (typeof props.width === 'number') {
      // this.contentStyle.width = props.width;
    }
    this.cellStyle = {};
    if (typeof props.height === 'number') {
      // this.cellStyle.height = props.height;
    }
  }

  componentDidMount(): void {
    this.props.tableSize.on(EVENT_NOTIFY_SIZE, this.onGetSize);
  }

  UNSAFE_componentWillReceiveProps(nextProps: Readonly<Props>): void {
    if (nextProps.tableSize !== this.props.tableSize) {
      this.props.tableSize.off(EVENT_NOTIFY_SIZE, this.onGetSize);
      nextProps.tableSize.on(EVENT_NOTIFY_SIZE, this.onGetSize);
    }
    if (nextProps.width !== this.props.width) {
      this.contentStyle = {};
      if (typeof nextProps.width === 'number') {
        // this.contentStyle.width = nextProps.width;
      }
      if (this.props.type === AnchorCell.type.COL) {
        this.contentStyle.height = 0;
      }
    }
    if (nextProps.height !== this.props.height) {
      this.cellStyle = {};
      if (typeof nextProps.height === 'number') {
        // this.cellStyle.height = nextProps.height;
      }
    }
  }

  componentWillUnmount(): void {
    this.props.tableSize.off(EVENT_NOTIFY_SIZE, this.onGetSize);
  }

  getIndex() {
    return this.props.type === AnchorCell.type.COL ? this.props.colIndex : this.props.rowIndex;
  }

  static type: { ROW: string; COL: string } = {
    ROW: 'row',
    COL: 'col',
  };

  contentRef = (ref: HTMLDivElement | null) => {
    if (ref) {
      this.content = ref;
    }
  };

  tdRef = (ref: HTMLTableCellElement | null) => {
    if (ref) {
      this.tdElement = ref;
    }
  };

  onGetSize = () => {
    const { type, rowIndex, colIndex } = this.props;
    const node = this.tdElement;
    if (!node) {
      return;
    }
    let width;
    let height;
    if (type === AnchorCell.type.COL) {
      if (!this.content) {
        return;
      }
      // const prev = this.content.style.width;
      // this.content.style.width = 'auto';
      width = node.getBoundingClientRect().width;
      // this.content.style.width = prev;
      this.props.tableSize.updateWidth(colIndex as number, width);
    } else {
      // const prev = node.style.height;
      // node.style.height = 'auto';
      height = node.getBoundingClientRect().height;
      // node.style.height = prev;
      this.props.tableSize.updateHeight(rowIndex as number, height);
    }
  };

  render() {
    const { type } = this.props;
    const index = this.getIndex();

    const className = `table-grid__cell-anchor
            table-grid__cell-anchor--${type}
            table-grid__cell-anchor--${type}-${index}
        `.trim();

    return (
      <td className={className} key={`${type}-${index}`} style={this.cellStyle} ref={this.tdRef}>
        <div
          ref={this.contentRef}
          className="table-grid__cell-anchor-content"
          style={this.contentStyle}
        />
      </td>
    );
  }
}

export default AnchorCell;

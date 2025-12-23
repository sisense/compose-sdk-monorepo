import * as React from 'react';

import { PivotDataNode } from '../../data-handling';
import { EVENT_DATABARS_CHANGED, TableSize } from '../../sizing/index.js';
import { Styles } from '../../utils/types.js';
import {
  DATABAR,
  DATABAR_BAR,
  DATABAR_INNER,
  DATABAR_SHOW,
  DATABAR_SHOW_ACTIVE,
} from './classes.js';
import { calcDataDar } from './helpers.js';

type Props = {
  style?: Styles;
  columnIndex: number;
  tableSize?: TableSize;
  dataNode?: PivotDataNode;
};

type State = {
  width?: number;
  left?: number;
  size?: number;
  sign?: number;
};

export class DataBar extends React.Component<Props, State> {
  root?: HTMLDivElement;

  style?: Styles;

  innerStyle?: Styles;

  timerShow?: number;

  timerShowInner?: number;

  constructor(props: Props) {
    super(props);

    this.state = {
      width: 0,
      left: 0,
      size: 0,
    };
  }

  componentDidMount(): void {
    if (this.props.tableSize) {
      this.props.tableSize.on(EVENT_DATABARS_CHANGED, this.onWidthChange);

      const data = this.props.tableSize.getDataBars();
      if (data) {
        this.onWidthChange(data);
      }
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps: Readonly<Props>): void {
    if (
      nextProps.tableSize !== this.props.tableSize ||
      nextProps.columnIndex !== this.props.columnIndex ||
      nextProps.dataNode !== this.props.dataNode ||
      nextProps.style !== this.props.style
    ) {
      this.style = undefined;
      this.innerStyle = undefined;
      if (this.root) {
        this.root.classList.remove(DATABAR_SHOW);
        this.root.classList.remove(DATABAR_SHOW_ACTIVE);
      }
    }

    if (nextProps.tableSize !== this.props.tableSize) {
      if (this.props.tableSize) {
        this.props.tableSize.off(EVENT_DATABARS_CHANGED, this.onWidthChange);
      }
      if (nextProps.tableSize) {
        nextProps.tableSize.on(EVENT_DATABARS_CHANGED, this.onWidthChange);

        const data = nextProps.tableSize.getDataBars();
        if (data) {
          this.onWidthChange(data);
        }
      }
    }
  }

  componentWillUnmount(): void {
    this.root = undefined;
    if (this.props.tableSize) {
      this.props.tableSize.off(EVENT_DATABARS_CHANGED, this.onWidthChange);
    }
    if (this.timerShow) {
      cancelAnimationFrame(this.timerShow);
    }

    if (this.timerShowInner) {
      cancelAnimationFrame(this.timerShowInner);
    }
  }

  getStyle(): Styles {
    if (!this.style) {
      const { width } = this.state;
      if (typeof width === 'undefined') {
        this.style = {};
        return this.style;
      }
      this.style = {
        width: `calc(100% - ${width}px)`,
      };
    }
    return this.style;
  }

  getInnerStyle(): Styles {
    if (!this.innerStyle) {
      const { style } = this.props;
      const { left, size, sign } = this.state;
      if (typeof left === 'undefined' || typeof size === 'undefined') {
        this.innerStyle = {};
        return this.innerStyle;
      }
      if (sign === 1) {
        this.innerStyle = {
          ...style,
          left: `${left}%`,
          width: `${size}%`,
        };
      } else {
        this.innerStyle = {
          ...style,
          right: `${100 - left}%`,
          width: `${-1 * size}%`,
        };
      }
    }
    return this.innerStyle;
  }

  onWidthChange = (data: { colsWidth: Array<number>; minMaxs: Array<Array<number>> }): void => {
    const { columnIndex, dataNode } = this.props;
    const { colsWidth, minMaxs } = data;
    let width = colsWidth[columnIndex];
    width += 8;
    const [min, max] = minMaxs[columnIndex] || [];
    const value = dataNode ? dataNode.value : undefined;
    const [left, size, sign] = calcDataDar(value, min, max);

    this.style = undefined;
    this.innerStyle = undefined;

    this.setState({
      width,
      left,
      size,
      sign,
    });

    if (typeof left === 'undefined' && typeof size === 'undefined') {
      return;
    }

    if (this.root) {
      this.root.classList.add(DATABAR_SHOW);
    }

    if (this.timerShow) {
      cancelAnimationFrame(this.timerShow);
    }
    this.timerShow = requestAnimationFrame(() => {
      if (this.timerShowInner) {
        // eslint-disable-next-line max-lines
        cancelAnimationFrame(this.timerShowInner);
      }
      this.timerShowInner = requestAnimationFrame(() => {
        if (this.root) {
          this.root.classList.add(DATABAR_SHOW_ACTIVE);
        }
      });
    });
  };

  rootRef = (ref: HTMLDivElement | null): void => {
    if (ref) {
      this.root = ref;
    }
  };

  render() {
    const { dataNode } = this.props;

    if (!dataNode || dataNode.value === null) {
      return null;
    }

    const style = this.getStyle();

    const innerStyle = this.getInnerStyle();

    return (
      <div className={DATABAR} style={style} ref={this.rootRef}>
        <div className={DATABAR_INNER}>
          <div className={DATABAR_BAR} style={innerStyle} />
        </div>
      </div>
    );
  }
}

export default DataBar;

import * as React from 'react';

import { EmbedComponentProps } from '../../data-handling/types.js';
import { Defer } from '../../utils/types.js';

type Props = EmbedComponentProps & {
  imageUrl: string;
  fallbackImageUrl?: string;
  rowHeight?: number;
  addCellDomReadyPromise?: (defer?: Defer) => void;
  removeCellDomReadyPromise?: (defer?: Defer) => void;
};

type State = {
  /** image src */
  imageUrl: string;
  /** image style object */
  imageStyle: React.CSSProperties;
};

export class EmbedImage extends React.PureComponent<Props, State> {
  /** content padding */
  cellPadding: number;

  /** ratio of an image */
  ratio: number;

  defaultHeight: number;

  /** container style object */
  style: React.CSSProperties = {};

  // @ts-ignore
  domReadyDefer: Defer;

  static defaultProps = {
    rowHeight: 60,
    fallbackImageUrl: '',
  };

  constructor(props: Props) {
    super(props);
    this.cellPadding = 7;
    this.ratio = 0;
    this.defaultHeight = 60;
    this.setStyle();

    this.state = {
      imageUrl: props.imageUrl,
      imageStyle: {
        position: 'absolute',
        top: '0',
        left: '0',
        display: 'block',
        width: this.getHeight() * this.ratio,
        height: '100%',
      },
    };
    this.setDefer();
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props): void {
    if (this.props.rowHeight !== nextProps.rowHeight) {
      this.setStyle(nextProps);
      this.setImageStyle(nextProps);
    }
    if (this.props.imageUrl !== nextProps.imageUrl) {
      this.setState({
        imageUrl: nextProps.imageUrl,
      });
    }
  }

  componentWillUnmount(): void {
    if (this.props.removeCellDomReadyPromise) {
      this.props.removeCellDomReadyPromise(this.domReadyDefer);
    }
  }

  getHeight(props?: Props): number {
    const rowHeight = props ? props.rowHeight : this.props.rowHeight;
    return (rowHeight || this.defaultHeight) - this.cellPadding;
  }

  setStyle(props?: Props): void {
    this.style = {
      position: 'relative',
      display: 'block',
      width: '100%',
      height: this.getHeight(props),
      fontSize: 0,
      lineHeight: 0,
    };
  }

  setImageStyle(props?: Props): void {
    const newWidth = this.ratio * this.getHeight(props);

    this.setState({
      imageStyle: {
        position: 'absolute',
        top: '0',
        left: '0',
        display: 'block',
        width: newWidth,
        height: '100%',
      },
    });
  }

  setDefer = () => {
    const defer: Defer = {
      promise: Promise.resolve(),
      resolve() {
        return true;
      },
      reject() {
        return false;
      },
    };
    const promise = new Promise((resolve, reject) => {
      defer.resolve = resolve;
      defer.reject = reject;
    });
    this.domReadyDefer = {
      ...defer,
      promise,
    };
    if (this.props.addCellDomReadyPromise) {
      this.props.addCellDomReadyPromise(this.domReadyDefer);
    }
  };

  onLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const width = event.currentTarget.naturalWidth;
    const height = event.currentTarget.naturalHeight;
    this.ratio = width / height;
    this.setImageStyle();
    setTimeout(() => {
      if (this.domReadyDefer) {
        this.domReadyDefer.resolve();
      }
    }, 0);
  };

  onError = (event: React.SyntheticEvent<HTMLImageElement, ErrorEvent>) => {
    const edge = (this.props.defaultHeight || this.defaultHeight) - this.cellPadding;
    this.setState({
      imageUrl: this.props.fallbackImageUrl || '',
      imageStyle: {
        position: 'absolute',
        top: '0',
        left: '0',
        display: 'block',
        width: edge,
        height: edge,
      },
    });
    setTimeout(() => {
      if (this.domReadyDefer) {
        this.domReadyDefer.resolve(event);
      }
    }, 0);
  };

  render() {
    return (
      <div style={this.style}>
        <img
          src={this.state.imageUrl}
          alt=""
          style={this.state.imageStyle}
          onLoad={this.onLoad}
          onError={this.onError}
        />
      </div>
    );
  }
}

export default EmbedImage;

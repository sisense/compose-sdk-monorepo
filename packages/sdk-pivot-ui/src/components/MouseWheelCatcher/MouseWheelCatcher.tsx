import * as React from 'react';

type Props = {
  children: React.ReactNode;
  onMouseScroll: Function | undefined;
  activated: boolean | undefined;
  className?: string;
  style?: React.CSSProperties;
};

export class MouseWheelCatcher extends React.PureComponent<Props> {
  container: HTMLDivElement | undefined;

  static defaultProps = {
    activated: true,
  };

  componentDidMount() {
    if (this.container) {
      this.container.addEventListener('mousewheel', this.onMouseWheel);
      this.container.addEventListener('DOMMouseScroll', this.onMouseWheel);
    }
  }

  componentWillUnmount() {
    if (this.container) {
      this.container.removeEventListener('mousewheel', this.onMouseWheel);
      this.container.removeEventListener('DOMMouseScroll', this.onMouseWheel);
    }
  }

  containerRef = (ref: HTMLDivElement) => {
    this.container = ref;
  };

  onMouseWheel = (event: any) => {
    if (!this.props.activated) {
      return;
    }
    const dir = Math.max(-1, Math.min(1, event.wheelDelta || -event.detail));
    const dirX = event.wheelDeltaX;
    const dirY = event.wheelDeltaY;

    if (this.props.onMouseScroll) {
      this.props.onMouseScroll(event, dir, dirX, dirY);
    }
  };

  render() {
    const {
      children,
      activated, // eslint-disable-line no-unused-vars
      onMouseScroll, // eslint-disable-line no-unused-vars
      ...props
    } = this.props;

    return (
      <div {...props} ref={this.containerRef}>
        {children}
      </div>
    );
  }
}

export default MouseWheelCatcher;

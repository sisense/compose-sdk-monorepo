import * as React from 'react';
import { Page } from './Page.js';

import { getChangedProps } from '../../utils/index.js';
import { FONT_MAP, LAYOUT, POSITION_MAP } from './constants.js';

type Props = {
  isFooterDisplayed: boolean;
  isPreRender: boolean;
  isHeaderDisplayed: boolean;
  titleName: string;
  height: number;
  width: number;
  pagesCount: number;
  renderContent: (page: number) => any;
  preRenderContent: () => any;
  position: string;
  size: string;
  padding: number;
  isPreview?: boolean;
  noResults?: boolean;
  onHeaderChanged?: (options: { title: string; titlePosition: string; titleSize: string }) => void;
  imageColumns?: Array<number>;
  cellDomReadyPromises?: Array<Promise<any>>;
  printDomReadyCallback?: Function | undefined;
};

type State = {
  titleName: string;
  position: string;
  size: string;
};

export class Layout extends React.Component<Props, State> {
  domReadyTriggerTime = 0;

  static defaultProps = {
    titleName: '',
    isPreRender: false,
    isPreview: false,
    renderContent: (page: number) => (
      <div>
        Default
        {page}
      </div>
    ),
    preRenderContent: () => <div>Default Pre-Render</div>,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      titleName: props.titleName || '',
      position: props.position ? POSITION_MAP[props.position] : POSITION_MAP.START,
      size: props.size ? props.size : FONT_MAP.MEDIUM,
    };
  }

  componentDidMount(): void {
    if (this.props.noResults) {
      this.onDomReady();
    }
  }

  componentWillReceiveProps(nextProps: Props): void {
    const changedProps = getChangedProps(nextProps, this.props);
    if (
      changedProps.titleName !== 'undefined' ||
      changedProps.position !== 'undefined' ||
      changedProps.size !== 'undefined'
    ) {
      this.setState({
        titleName: nextProps.titleName,
        position: nextProps.position,
        size: nextProps.size,
      });
    }
  }

  componentDidUpdate() {
    if (!this.props.imageColumns || !this.props.imageColumns.length) {
      this.onDomReady();
      return;
    }

    if (this.props.cellDomReadyPromises) {
      const domReadyTriggerTime = new Date().getTime();
      Promise.all(this.props.cellDomReadyPromises).then(() => {
        if (this.domReadyTriggerTime !== domReadyTriggerTime) {
          return;
        }
        this.onDomReady();
      });
      this.domReadyTriggerTime = domReadyTriggerTime;
    }
  }

  preRenderLayout(): React.ReactElement {
    const { preRenderContent } = this.props;
    return preRenderContent();
  }

  onDomReady = () => {
    if (this.props.printDomReadyCallback) {
      this.props.printDomReadyCallback();
    }
  };

  onApplyHeaderChanges = (state: State): void => {
    const { titleName, position, size } = state;
    if (this.props.onHeaderChanged) {
      this.props.onHeaderChanged({
        title: titleName,
        titlePosition: position,
        titleSize: size,
      });
    }
    this.setState(state);
  };

  renderPage = (el: any, index: number) => {
    const { titleName, position, size } = this.state;
    const { isHeaderDisplayed, pagesCount, renderContent, height, isPreview, padding } = this.props;
    const pageStyles = {
      height: isPreview ? height + padding : height,
    };
    return (
      <Page
        key={index}
        titleName={titleName}
        pageNumber={index + 1}
        total={pagesCount}
        position={position}
        isHeader={isHeaderDisplayed}
        size={size}
        pageStyles={pageStyles}
        onApplyHeaderChanges={this.onApplyHeaderChanges}
        isPreview={isPreview}
      >
        {renderContent}
      </Page>
    );
  };

  renderPages(): Array<React.ReactElement> {
    return Array.from({ length: this.props.pagesCount }, this.renderPage);
  }

  render() {
    const { width, isFooterDisplayed, isPreRender, isPreview } = this.props;

    const styles = {
      width: isPreview ? width + 74 : width,
    };

    const layoutClassName = `${LAYOUT.PREVIEW} ${LAYOUT.CONTAINER} ${
      isPreview ? LAYOUT.LAYOUT_PREVIEW : ''
    } ${isFooterDisplayed ? LAYOUT.SHOW_FOOTER : ''}`;

    return (
      <div className={layoutClassName} style={styles}>
        {isPreRender ? this.preRenderLayout() : this.renderPages()}
      </div>
    );
  }
}

export default Layout;

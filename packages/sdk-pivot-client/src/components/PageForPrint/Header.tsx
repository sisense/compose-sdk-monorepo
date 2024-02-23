/* eslint-disable jsx-a11y/tabindex-no-positive, react/no-array-index-key */
import * as React from 'react';
import { ControlButton } from './ControlButton.js';
import {
  HEADER,
  FONT_SIZE,
  JUSTIFY_CONTENT,
  TEXT_ALIGN,
  FONT_MAP,
  POSITION_MAP,
} from './constants.js';

type Props = {
  titleName: string;
  isHeader: boolean;
  size: string;
  position: string;
  onChangesApply: (options: OnChangesApplyProps) => void;
};

type State = {
  titleName: string;
  isFocused: boolean;
  size: string;
  position: string;
};

export type OnChangesApplyProps = {
  titleName: string;
  size: string;
  position: string;
};

export class Header extends React.PureComponent<Props, State> {
  containerTimeout?: NodeJS.Timeout | number;

  constructor(props: Props) {
    super(props);

    this.state = {
      titleName: props.titleName,
      isFocused: false,
      size: props.size || FONT_MAP.MEDIUM,
      position: props.position || POSITION_MAP.START,
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    const { titleName, size, position } = nextProps;

    if (
      titleName !== this.props.titleName ||
      size !== this.props.size ||
      position !== this.props.position
    ) {
      this.setState({
        titleName,
        size,
        position,
      });
    }
  }

  clearState() {
    const { titleName, size, position } = this.props;
    this.setState({
      titleName,
      size,
      position,
      isFocused: false,
    });
  }

  onApplyClick = () => {
    this.setState({
      isFocused: false,
    });
    this.props.onChangesApply({
      titleName: this.state.titleName,
      size: this.state.size,
      position: this.state.position,
    });
  };

  onCancelClick = () => {
    this.clearState();
  };

  onControlsBlur = () => {
    this.setState({
      isFocused: false,
    });
  };

  onControlsFocus = () => {
    this.setState({
      isFocused: true,
    });
  };

  handleHeaderContainerBlur = () => {
    this.clearState();
  };

  onHeaderContainerFocus = () => {
    this.setState({
      isFocused: true,
    });
    if (this.containerTimeout) {
      clearTimeout(this.containerTimeout as NodeJS.Timeout);
    }
  };

  onKeyUp = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.keyCode === 13) {
      e.currentTarget.click();
    }
  };

  onButtonClick = (cbProps: { size?: string; position?: string }) => {
    if (cbProps.size) {
      this.setState({
        size: cbProps.size,
      });
    }
    if (cbProps.position) {
      this.setState({
        position: cbProps.position,
      });
    }
  };

  onHeaderContainerBlur = () => {
    this.containerTimeout = setTimeout(this.handleHeaderContainerBlur, 300);
  };

  onHeaderTitleBlur = (e: React.FocusEvent<HTMLElement>) => {
    this.setState({
      titleName: e.target.textContent || '',
    });
    this.onHeaderContainerBlur();
  };

  onHeaderTitleInput = (e: React.FormEvent<HTMLElement>) => {
    // @ts-ignore
    if (!(e.target.textContent || '').length) {
      this.setState({
        titleName: '',
      });
    }
  };

  renderButtons() {
    const buttons = [
      {
        attrs: { tabIndex: 3 },
        callbackProps: { size: FONT_MAP.SMALL },
        content: 'Small',
      },
      {
        attrs: { tabIndex: 4 },
        callbackProps: { size: FONT_MAP.MEDIUM },
        content: 'Medium',
      },
      {
        attrs: { tabIndex: 5 },
        callbackProps: { size: FONT_MAP.LARGE },
        content: 'Large',
      },
      {
        attrs: { tabIndex: 6, className: HEADER.LEFT_TEXT },
        callbackProps: { position: POSITION_MAP.START },
      },
      {
        attrs: { tabIndex: 7, className: HEADER.CENTER_TEXT },
        callbackProps: { position: POSITION_MAP.CENTER },
      },
      {
        attrs: { tabIndex: 8, className: HEADER.END_TEXT },
        callbackProps: { position: POSITION_MAP.END },
      },
    ];
    return buttons.map((button, index) => (
      <ControlButton
        key={index}
        events={{
          onClick: this.onButtonClick,
          onFocus: this.onHeaderContainerFocus,
          onBlur: this.onHeaderContainerBlur,
        }}
        {...button}
      />
    ));
  }

  render() {
    const { isFocused, size, position, titleName } = this.state;
    const contentStyles: Record<string, string> = {
      justifyContent: JUSTIFY_CONTENT[position],
    };
    const titleStyles: React.CSSProperties = {
      // @ts-ignore
      textAlign: TEXT_ALIGN[position],
      fontSize: FONT_SIZE[size],
    };
    const { isHeader } = this.props;
    const placeholder = titleName.length ? {} : { placeholder: 'Add a title' };
    return (
      <div className={`${HEADER.CONTAINER} ${isHeader ? HEADER.SHOW_CONTENT : ''}`}>
        <div className={`${HEADER.CONTENT_WRAPPER} ${isFocused ? HEADER.FOCUSED : ''}`}>
          <div style={contentStyles} className={HEADER.TITLE_WRAPPER}>
            <div
              style={titleStyles}
              className={HEADER.TITLE}
              {...placeholder}
              contentEditable
              onBlur={this.onHeaderTitleBlur}
              onFocus={this.onHeaderContainerFocus}
              onInput={this.onHeaderTitleInput}
              dangerouslySetInnerHTML={{ __html: titleName }}
            />
            <div className={HEADER.RENAME_CONTROLS}>
              {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
              <div
                role="button"
                tabIndex={1}
                className={`${HEADER.RENAME_OK} ${HEADER.RENAME_ACTION} ctrl`}
                onKeyUp={this.onKeyUp}
                onBlur={this.onControlsBlur}
                onFocus={this.onControlsFocus}
                onClick={this.onApplyClick}
              />
              {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
              <div
                role="button"
                tabIndex={2}
                className={`${HEADER.RENAME_CANCEL} ${HEADER.RENAME_ACTION} ctrl`}
                onKeyUp={this.onKeyUp}
                onBlur={this.onControlsBlur}
                onFocus={this.onControlsFocus}
                onClick={this.onCancelClick}
              />
            </div>
          </div>
          <div className={HEADER.DIVIDER} />
          <div className={HEADER.EDITORS}>
            {this.renderButtons().slice(3)}
            <div className={HEADER.VERTICAL_LINE} />
            {this.renderButtons().slice(0, 3)}
          </div>
        </div>
      </div>
    );
  }
}

export default Header;

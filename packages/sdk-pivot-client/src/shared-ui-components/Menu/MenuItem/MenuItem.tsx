import React, { Component } from 'react';
import classnames from 'classnames';

import { DEPRECATED_Icon } from '../../DEPRECATED_Icon';
import { RadioButton } from '../../RadioButton';
import { DEPRECATED_Toggle } from '../../DEPRECATED_Toggle';
import { DEPRECATED_Checkbox } from '../../DEPRECATED_Checkbox';
import { DEPRECATED_Tooltip } from '../../DEPRECATED_Tooltip';

import styles from '../Menu.module.scss';

import { styleguideConstants } from '../../constants/styleguideConstants';

export type ItemType = 'item' | 'radio' | 'checkbox' | 'toggle' | 'nested';

export const itemTypes: { [key: string]: ItemType } = Object.freeze({
  ITEM: 'item',
  RADIO: 'radio',
  CHECKBOX: 'checkbox',
  TOGGLE: 'toggle',
  NESTED: 'nested',
});

export type MenuItemProps = {
  checked?: boolean;
  className?: string;
  dataTestId?: string;
  disabled?: boolean;
  handleClick: () => void;
  handleOut?: () => void;
  handleOver?: () => void;
  iconClass?: string;
  iconName?: string;
  isDrill?: boolean;
  caption: string;
  subCaption?: string;
  level?: number;
  tooltip?: string | React.ReactFragment;
  classNameTooltip?: string;
  type: ItemType;
  selected?: boolean;
};

export class MenuItem extends Component<MenuItemProps, unknown> {
  static defaultProps = {
    className: '',
  };

  constructor(props: MenuItemProps) {
    super(props);
    this.state = { inInlineConfirmation: false };
  }

  getContent() {
    const { type, caption, subCaption, checked, selected } = this.props;
    switch (type) {
      case itemTypes.RADIO:
        return (
          <RadioButton
            text={caption}
            name={caption}
            onChange={() => null}
            value={caption}
            checked={Boolean(checked)}
            preventClick
          />
        );
      case itemTypes.CHECKBOX:
        return (
          <DEPRECATED_Checkbox
            title={caption}
            text={caption}
            onChange={() => null}
            checked={Boolean(checked)}
            className={styles.itemCheckBox}
          />
        );
      case itemTypes.TOGGLE:
        return (
          <div>
            <span>{caption}</span>
            <DEPRECATED_Toggle
              onChange={() => null}
              className={styles.toggleButtonMenu}
              checked={Boolean(checked)}
            />
          </div>
        );
      case itemTypes.NESTED:
        return (
          <div className={styles.nestedType}>
            <div>{caption}</div>
            <DEPRECATED_Icon className={styles.nestedIcon} name="general-double-arrow-front" />
            <div>{subCaption}</div>
          </div>
        );
      default:
        return (
          <div className={styles.itemType}>
            {caption}
            {selected && <DEPRECATED_Icon name="general-vi-small-white" />}
          </div>
        );
    }
  }

  handleClick(e: React.MouseEvent) {
    //This line is must-to-have if we update rc-tooltip version to 3.7.3 or upper
    e.stopPropagation();
    const { handleClick, disabled } = this.props;

    if (disabled) {
      return;
    }

    handleClick();
  }

  renderRegularMenuItem = () => {
    const { dataTestId, iconName, iconClass, isDrill } = this.props;

    return (
      <span className={styles.itemContainer}>
        {iconName && <DEPRECATED_Icon name={iconName} className={iconClass} />}
        <span
          data-testid={dataTestId}
          className={classnames(styles.menuItemText, styleguideConstants.TEXT_PRIMARY)}
        >
          {this.getContent()}
        </span>
        {isDrill && <DEPRECATED_Icon name={'general-arrow-right'} />}
      </span>
    );
  };

  renderMenuItem = () => {
    const { tooltip, classNameTooltip, level } = this.props;
    const menuItemContent = this.renderRegularMenuItem();

    if (tooltip) {
      const overlay = <div>{tooltip}</div>;

      return (
        <DEPRECATED_Tooltip
          overlay={overlay}
          placement="right"
          overlayClassName={classnames(classNameTooltip, styles.menuItemTooltip)}
          mouseLeaveDelay={0}
          align={{ offset: [level ? 5 : 10, 0] }}
        >
          {menuItemContent}
        </DEPRECATED_Tooltip>
      );
    }

    return menuItemContent;
  };

  render() {
    const { checked, className, iconName, handleOver, handleOut, disabled } = this.props;
    // const { inInlineConfirmation } = this.state;
    const inInlineConfirmation = false;

    const itemClasses = classnames(className, {
      [styles.checked]: checked,
      [styles.noIcon]: !iconName || inInlineConfirmation,
      [styles.disabled]: disabled,
      [styleguideConstants.TEXT_PRIMARY]: checked,
      [styleguideConstants.TEXT_SECONDARY_HOVER]: !checked && !disabled,
      [styleguideConstants.TEXT_SECONDARY]: disabled,
    });

    return (
      <li
        data-menu-item
        className={itemClasses}
        onClick={this.handleClick.bind(this)}
        onMouseOver={handleOver}
        onMouseOut={handleOut}
      >
        {this.renderMenuItem()}
      </li>
    );
  }
}

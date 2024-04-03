import React, { Component } from 'react';
import classnames from 'classnames';
import { Scrollbars } from 'react-custom-scrollbars';
import type { ScrollbarProps } from 'react-custom-scrollbars';

import { Popover } from '../Popover';
import { LazyLoader } from '../LazyLoader';
import { MenuItem } from './MenuItem';
import { Confirmation } from './Confirmation';

import type { ItemType } from './MenuItem';

import { groupBy } from './utils';

import style from './Menu.module.scss';

export type MenuItemConfig = {
  actionableComponent?: ActionableComponent;
  caption: string;
  subCaption?: string;
  checked?: boolean;
  confirmation?: {
    title: string;
    message: string;
    inline: boolean;
  };
  dataTestId?: string;
  disabled?: boolean;
  groupId?: string;
  hidden?: boolean;
  iconClass?: string;
  iconName?: string;
  id: string;
  onClick?: () => void;
  selected?: boolean;
  separator?: boolean;
  subItems?: MenuItemConfig[];
  subItemScrollbarClassName?: string;
  tooltip?: string | React.ReactFragment;
  type: ItemType;
  value?: string;
  groupTitle?: boolean;
};

type ActionableComponent = {
  component: React.ComponentType<{ onRequestClose?: () => void }>;
  componentProps: any;
};

export type MenuProps = {
  className?: string;
  items: MenuItemConfig[];
  level?: number;
  onItemSelected: (menuItemConfig: MenuItemConfig, value?: string) => void;
  onMouseEnter?: () => void;
  onRequestClose?: () => void;
  scrollbarProps: ScrollbarProps;
  width?: number;
  isLoading?: boolean;
  classNameTooltip?: string;
  zIndex?: number;
};

type State = {
  activeSubMenu: string | null;
  isHoverSubMenu: boolean;
};

const noop = () => {};

export class Menu extends Component<MenuProps, State> {
  timeoutIn: number | null;

  static defaultProps = {
    onMouseEnter: noop,
    onRequestClose: noop,
    scrollbarProps: {},
    level: 0,
    isLoading: false,
    zIndex: 1,
  };

  constructor(props: MenuProps) {
    super(props);

    this.state = {
      activeSubMenu: null,
      isHoverSubMenu: false,
    };

    this.timeoutIn = null;
  }

  componentWillUnmount() {
    this.clearTimeout();
  }

  handleClick = (item: MenuItemConfig) => {
    if (item.subItems || item.actionableComponent) {
      this.clearTimeout();

      if (this.state.activeSubMenu === item.id) {
        this.closeSubMenu();
      } else {
        this.setState({ activeSubMenu: item.id });
      }

      return;
    } else if (item.confirmation && !item.confirmation.inline) {
      this.clearTimeout();
      this.setState({ activeSubMenu: item.id });
      return;
    }

    const { onItemSelected } = this.props;
    onItemSelected(item, item.value);
  };

  handleOver = (item: MenuItemConfig) => {
    this.clearTimeout();
    this.setState({ isHoverSubMenu: false });

    const activeSubMenu = item.subItems || item.actionableComponent ? item.id : null;

    this.timeoutIn = window.setTimeout(() => {
      this.setState({
        activeSubMenu,
      });
    }, 900);
  };

  handleOut = (item: MenuItemConfig) => {
    if ((item.subItems || item.actionableComponent) && this.state.activeSubMenu) {
      this.clearTimeout();
    }
  };

  clearTimeout() {
    if (!this.timeoutIn) {
      return;
    }

    clearTimeout(this.timeoutIn);
    this.timeoutIn = null;
  }

  onSubMenuMouseEnter = () => {
    this.clearTimeout();
    this.setState({ isHoverSubMenu: true });
  };

  onSubMenuMouseLeave = () => {
    this.setState({ isHoverSubMenu: false });
  };

  closeSubMenu = () => {
    this.setState({ activeSubMenu: null });
  };

  onConfirm = (item: MenuItemConfig) => {
    const { onItemSelected } = this.props;
    this.closeSubMenu();
    onItemSelected(item);
  };

  getSeparateGroups(items: MenuItemConfig[]) {
    const menuItemsGroupMap = groupBy(items, (item) => item.groupId || '');
    const groupsList = Object.values(menuItemsGroupMap);

    const groupsToAddSeparator = groupsList.slice(1);
    groupsToAddSeparator.forEach((group) => (group[0].separator = true));

    return groupsList;
  }

  renderMenuItem = (item: MenuItemConfig) => {
    const { onItemSelected, onRequestClose, level, classNameTooltip, zIndex, className } =
      this.props;

    let menuItemClass = classnames(style[item.type], {
      [style.isDrill]: item.subItems,
      [style.separator]: item.separator,
      fakeHover: item.checked,
      [style.groupHeader]: item.groupTitle,
    });

    const createMenuItem = (menuItemClass: string) => {
      // const { confirmation = { inline: false } } = item;
      const iconClass = classnames(item.iconClass, style.icon);
      return (
        <MenuItem
          className={menuItemClass}
          checked={item.checked}
          dataTestId={item.dataTestId}
          disabled={item.disabled}
          key={item.id}
          type={item.type}
          caption={item.caption}
          subCaption={item.subCaption}
          tooltip={item.tooltip}
          classNameTooltip={classNameTooltip}
          iconName={item.iconName}
          // trailElement={item.trailElement}
          iconClass={iconClass}
          isDrill={!!item.subItems || !!item.actionableComponent}
          // inlineConfirmation={confirmation.inline}
          // inlineMessage={confirmation.message}
          level={level}
          selected={item.selected}
          handleClick={() => this.handleClick(item)}
          handleOver={() => this.handleOver(item)}
          handleOut={() => this.handleOut(item)}
        />
      );
    };

    let subItems = item.subItems;
    if (subItems) {
      const subMenuVisible = this.state.activeSubMenu === item.id;
      let handleClick = this.handleClick;
      menuItemClass = classnames(menuItemClass, {
        fakeHover: subMenuVisible && this.state.isHoverSubMenu,
      });

      if (item.value !== undefined) {
        subItems = subItems.map(function (subItem) {
          return {
            ...subItem,
            checked: subItem.value === item.value,
          };
        });

        handleClick = (childItem) => onItemSelected(item, childItem.value);
      }

      const overlay = () => (
        <Menu
          items={subItems || []}
          className={className}
          onItemSelected={handleClick}
          onMouseEnter={this.onSubMenuMouseEnter}
          scrollbarProps={{
            className: item.subItemScrollbarClassName,
          }}
          level={(level || 0) + 1}
          zIndex={(zIndex || 1) + 1}
        />
      );

      return (
        <Popover
          key={item.id}
          visible={subMenuVisible}
          level={1}
          mask={false}
          trigger={[]}
          placement="rightTop"
          align={{ offset: [0, 0] }}
          overlay={overlay}
          onRequestClose={onRequestClose}
          zIndex={(zIndex || 1) + 1}
        >
          {createMenuItem(menuItemClass)}
        </Popover>
      );
    } else if (item.actionableComponent) {
      // eslint-disable-next-line
      const { componentProps } = item.actionableComponent;
      const Component: any = item.actionableComponent.component;
      const actionableComponentVisible = this.state.activeSubMenu === item.id;
      const overlay = () => <Component {...componentProps} onRequestClose={onRequestClose} />;

      return (
        <Popover
          key={item.id}
          visible={actionableComponentVisible}
          level={1}
          mask={false}
          trigger={[]}
          placement="rightTop"
          align={{ offset: [10, 0] }}
          overlay={overlay}
          onRequestClose={onRequestClose}
        >
          {createMenuItem(menuItemClass)}
        </Popover>
      );
    } else if (item.confirmation && !item.confirmation.inline) {
      const confirmConfig = item.confirmation;
      const confirmationVisible = this.state.activeSubMenu === item.id;
      const overlay = () => (
        <Confirmation
          title={confirmConfig.title}
          message={confirmConfig.message}
          onCancel={this.closeSubMenu}
          onConfirm={() => this.onConfirm(item)}
        />
      );

      return (
        <Popover
          key={item.id}
          visible={confirmationVisible}
          level={1}
          mask
          trigger={[]}
          placement="rightBottom"
          align={{ offset: [10, 0] }}
          overlay={overlay}
          onRequestClose={this.closeSubMenu}
        >
          {createMenuItem(menuItemClass)}
        </Popover>
      );
    }

    return createMenuItem(menuItemClass);
  };

  render() {
    const {
      items,
      className,
      onMouseEnter,
      scrollbarProps: { className: scrollClass, ...otherScrollbarProps },
      width,
      isLoading,
    } = this.props;
    let visibleItems = items.filter((item) => !item.hidden);
    visibleItems = visibleItems.map((item, index) => {
      if (item.separator && !visibleItems[index - 1]) {
        item.separator = false;
      }
      return item;
    });

    const containerClasses = classnames(style.container, className);
    const scrollbarClasses = classnames(style.scrollbar, scrollClass);

    const styles = width ? { width: `${width}px`, minWidth: 'inherit' } : {};
    const loaderClass = isLoading ? style.loader : '';

    return (
      <div className={containerClasses} onMouseEnter={onMouseEnter} style={styles}>
        <Scrollbars className={scrollbarClasses} {...otherScrollbarProps} hideTracksWhenNotNeeded>
          {this.getSeparateGroups(visibleItems).map((group, index) => {
            return (
              <div className={style.separateGroup} key={index}>
                {group.map(this.renderMenuItem)}
              </div>
            );
          })}
          <div className={loaderClass}>
            <LazyLoader isLoading={isLoading} />
          </div>
        </Scrollbars>
      </div>
    );
  }
}

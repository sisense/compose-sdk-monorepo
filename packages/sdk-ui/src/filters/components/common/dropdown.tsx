/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { type FunctionComponent, useRef, useState } from 'react';

import Button from '@mui/material/Button';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Popper from '@mui/material/Popper';

import { useThemeContext } from '../../../theme-provider';
import { getSlightlyDifferentColor } from '../../../utils/color';

export type DropdownProps = {
  elements: JSX.Element[];
  icon?: JSX.Element;
  selectedIdx?: number;
  disabled?: boolean;
} & React.ComponentProps<typeof MenuList>;

export const Dropdown: FunctionComponent<DropdownProps> = (props) => {
  const [open, setOpen] = useState(false);
  const { themeSettings } = useThemeContext();
  const toggleOpen = () => {
    setOpen(!open);
  };
  const anchorRef = useRef(null);
  const selected = props.selectedIdx ?? null;
  const muiSx = {
    fontFamily: themeSettings.typography.fontFamily,
    fontWeight: 400,
    textTransform: 'none',
    fontSize: '13px',
    color: themeSettings.typography.primaryTextColor,
  };

  const menuItems = props.elements.map((element, idx) => {
    return (
      <MenuItem
        key={idx}
        onClick={() => {
          setOpen(false);
        }}
        sx={{
          ...muiSx,
          minHeight: 'unset',
          '&:hover': {
            backgroundColor: getSlightlyDifferentColor(themeSettings.general.backgroundColor),
          },
        }}
        disabled={props.disabled}
      >
        {element}
      </MenuItem>
    );
  });
  return (
    <>
      <Button
        ref={anchorRef}
        onClick={toggleOpen}
        className={'csdk-h-full csdk-border-solid csdk-border-input csdk-box-border'}
        sx={{
          ...muiSx,
          border: '1px solid rgb(110 115 125 / var(--tw-border-opacity))',
          marginLeft: '5px',
          marginRight: '5px',
          borderRadius: '0.375rem',
          verticalAlign: 'unset',
          '&:hover': {
            backgroundColor: getSlightlyDifferentColor(themeSettings.general.backgroundColor),
          },
        }}
        disabled={props.disabled}
      >
        {props.icon ?? selected !== null ? props.elements[selected ?? 0] : <div>{'Select...'}</div>}
      </Button>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        sx={{
          backgroundColor: themeSettings.general.backgroundColor,
          border: '1px solid #c4c8cd',
          borderRadius: '4px',
          boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.25)',
        }}
      >
        <ClickAwayListener onClickAway={() => setOpen(false)}>
          <MenuList autoFocusItem={open}>{menuItems}</MenuList>
        </ClickAwayListener>
      </Popper>
    </>
  );
};

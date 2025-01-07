import { ReactNode } from 'react';
import MuiPopover from '@mui/material/Popover';

/** @internal */
export type PopoverAnchorPosition = {
  anchorEl: HTMLElement;
  anchorOrigin: {
    vertical: 'top' | 'center' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
  contentOrigin: {
    vertical: 'top' | 'center' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
};

// todo: add fixed position (like MenuPosition)
type PopoverPosition = PopoverAnchorPosition;

type PopoverProps = {
  children: ReactNode;
  open: boolean;
  position?: PopoverPosition;
  onClose?: () => void;
};

/** @internal */
export const Popover = (props: PopoverProps) => {
  const { children, open, position, onClose, ...restProps } = props;
  return (
    <MuiPopover
      anchorEl={position?.anchorEl}
      anchorOrigin={position?.anchorOrigin}
      transformOrigin={position?.contentOrigin}
      open={open}
      onClose={onClose}
      {...restProps}
    >
      {children}
    </MuiPopover>
  );
};

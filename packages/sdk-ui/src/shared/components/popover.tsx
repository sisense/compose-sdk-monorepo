import { ReactNode } from 'react';

// This is the original custom popover, it has to use MUI Popover as a base component
// eslint-disable-next-line rulesdir/prefer-custom-popover
import MuiPopover from '@mui/material/Popover';

import styled from '@/infra/styled';

/* eslint-disable rulesdir/opacity-zero-needs-focus-visible */
const StyledMuiPopover = styled(MuiPopover)`
  // This fixes an issue where the popover appears before its position is calculated, causing it to 'jump' from the top-left corner.
  // Known MUI issue: https://github.com/mui/material-ui/issues/8040
  .MuiPaper-root.MuiPopover-paper:not([style*='top']),
  .MuiPaper-root.MuiPopover-paper:not([style*='left']) {
    opacity: 0 !important;
  }
`;
/* eslint-enable rulesdir/opacity-zero-needs-focus-visible */

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
  id?: string;
  position?: PopoverPosition;
  onClose?: () => void;
  BackdropProps?: {
    invisible?: boolean;
    style?: React.CSSProperties;
  };
  style?: React.CSSProperties;
  slotProps?: {
    paper?: {
      sx?: Record<string, any>;
    };
  };
};

/** @internal */
export const Popover = (props: PopoverProps) => {
  const { children, open, id, position, onClose, BackdropProps, style, slotProps, ...restProps } =
    props;
  return (
    <StyledMuiPopover
      id={id}
      className={'csdk-accessible'}
      anchorEl={position?.anchorEl}
      anchorOrigin={position?.anchorOrigin}
      transformOrigin={position?.contentOrigin}
      transitionDuration={0}
      open={open}
      BackdropProps={BackdropProps}
      style={style}
      slotProps={{
        paper: {
          sx: {
            display: 'flex',
            boxShadow: '-1px -1px 10px rgba(0, 0, 0, 0.2)',
            ...slotProps?.paper?.sx,
          },
        },
      }}
      onClose={onClose}
      {...restProps}
    >
      {children}
    </StyledMuiPopover>
  );
};

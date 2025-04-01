import { ReactNode } from 'react';
import MuiPopover from '@mui/material/Popover';
import styled from '@emotion/styled';

const StyledMuiPopover = styled(MuiPopover)`
  // This fixes an issue where the popover appears before its position is calculated, causing it to 'jump' from the top-left corner.
  // Known MUI issue: https://github.com/mui/material-ui/issues/8040
  .MuiPaper-root.MuiPopover-paper:not([style*='top']),
  .MuiPaper-root.MuiPopover-paper:not([style*='left']) {
    opacity: 0 !important;
  }
`;

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
};

/** @internal */
export const Popover = (props: PopoverProps) => {
  const { children, open, id, position, onClose, ...restProps } = props;
  return (
    <StyledMuiPopover
      id={id}
      className={'csdk-accessible'}
      anchorEl={position?.anchorEl}
      anchorOrigin={position?.anchorOrigin}
      transformOrigin={position?.contentOrigin}
      transitionDuration={0}
      open={open}
      slotProps={{
        paper: { sx: { display: 'flex', boxShadow: '-1px -1px 10px rgba(0, 0, 0, 0.2)' } },
      }}
      onClose={onClose}
      {...restProps}
    >
      {children}
    </StyledMuiPopover>
  );
};

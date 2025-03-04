import MuiPopper from '@mui/material/Popper';

type PopperProps = {
  children: React.ReactNode;
  open: boolean;
  anchorEl: HTMLElement | null;
  style?: React.CSSProperties;
};

export const Popper = ({ children, open, anchorEl, style }: PopperProps) => {
  return (
    <MuiPopper
      anchorEl={anchorEl}
      open={open}
      style={style}
      slotProps={{
        root: {
          style: {
            // should be higher than Popover
            zIndex: 1301,
            display: 'flex',
            boxShadow: '-1px -1px 10px rgba(0, 0, 0, 0.2)',
            borderRadius: 4,
            overflow: 'hidden',
          },
        },
      }}
    >
      {children}
    </MuiPopper>
  );
};

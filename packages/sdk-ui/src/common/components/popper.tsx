import MuiPopper from '@mui/material/Popper';

type PopperProps = {
  children: React.ReactNode;
  open: boolean;
  anchorEl: HTMLElement | null;
  style?: React.CSSProperties;
  /**
   * If true, the click event will not be propagated to the parent elements outside of the popper.
   * Useful for React to Preact compatibility issues related to different event handling mechanisms - virtual DOM vs real DOM.
   */
  preventClickPropagation?: boolean;
};

export const Popper = ({
  children,
  open,
  anchorEl,
  style,
  preventClickPropagation = false,
}: PopperProps) => {
  const handleClick = (event: React.MouseEvent) => {
    if (preventClickPropagation) {
      event.stopPropagation();
    }
  };

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
      <div onClick={handleClick}>{children}</div>
    </MuiPopper>
  );
};

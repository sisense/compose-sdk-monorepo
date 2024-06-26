import { Popper } from '@mui/material';
import { ScrollToBottomButton } from './buttons/scroll-to-bottom-button';

type ScrollToBottomProps = {
  isVisible: boolean;
  anchorElement: HTMLDivElement | null;
  onClick: () => void;
};

export const ScrollToBottom = ({ isVisible, onClick, anchorElement }: ScrollToBottomProps) => {
  return (
    <Popper anchorEl={anchorElement} open={isVisible} placement={'top'} sx={{ zIndex: 2 }}>
      <ScrollToBottomButton onClick={onClick} />
    </Popper>
  );
};

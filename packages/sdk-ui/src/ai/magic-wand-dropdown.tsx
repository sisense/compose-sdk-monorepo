import { IconButton, Popover } from '@mui/material';
import { useState } from 'react';

import MagicWandIcon from './icons/magic-wand-icon';
import SuggestionDropdownList from './suggestions/suggestion-dropdown-list';
import { colors } from '../themes/colors';

export default function MagicWandDropdown({
  questions,
  onSelection,
  isLoading,
  anchorEl,
}: {
  questions: string[];
  onSelection: (question: string) => void;
  isLoading: boolean;
  anchorEl: Element | null;
}) {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <IconButton
        sx={{
          p: '2px',
          '&.MuiIconButton-root:hover': {
            backgroundColor: colors.interaction.defaultHover,
          },
        }}
        onClick={handleClick}
      >
        <MagicWandIcon />
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        marginThreshold={0}
      >
        <div style={{ width: anchorEl?.clientWidth }}>
          <SuggestionDropdownList
            isLoading={isLoading}
            onSelect={(msg) => {
              onSelection(msg);
              handleClose();
            }}
            suggestions={questions.slice(0, 4)}
          />
        </div>
      </Popover>
    </>
  );
}

import ThreeDotsIcon from '@/ai/icons/three-dots-icon';
import { getSlightlyDifferentColor } from '@/utils/color';
import IconButton from '@mui/material/IconButton';
import { MouseEventHandler, useCallback } from 'react';

type MenuButtonProps = {
  color?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  ariaLabel?: string;
};

export const MenuButton = ({ color, onClick, ariaLabel, ...restProps }: MenuButtonProps) => {
  const getHoverColor = useCallback(() => {
    return getSlightlyDifferentColor(color ?? '', undefined, 0.1);
  }, [color]);

  return (
    <IconButton
      sx={{
        padding: 0,
        '&:hover': {
          backgroundColor: getHoverColor(),
        },
      }}
      onClick={onClick}
      aria-label={ariaLabel}
      {...restProps}
    >
      <ThreeDotsIcon fill={color} />
    </IconButton>
  );
};

import { MouseEventHandler, useCallback } from 'react';

import IconButton from '@mui/material/IconButton';

import styled from '@/infra/styled';
import ThreeDotsIcon from '@/modules/ai/icons/three-dots-icon';
import { getSlightlyDifferentColor } from '@/shared/utils/color';

type MenuButtonProps = {
  color?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  ariaLabel?: string;
};

const StyledIconButton = styled(IconButton)`
  min-width: 28px;
  min-height: 28px;
`;

export const MenuButton = ({ color, onClick, ariaLabel, ...restProps }: MenuButtonProps) => {
  const getHoverColor = useCallback(() => {
    return getSlightlyDifferentColor(color ?? '', undefined, 0.1);
  }, [color]);

  return (
    <StyledIconButton
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
    </StyledIconButton>
  );
};

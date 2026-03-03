import { MouseEventHandler, useCallback } from 'react';

import IconButton from '@mui/material/IconButton';

import styled from '@/infra/styled';
import ThreeDotsIcon from '@/modules/ai/icons/three-dots-icon';
import { getSlightlyDifferentColor } from '@/shared/utils/color';

type MenuButtonProps = {
  color?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  ariaLabel?: string;
  size?: number;
};

type SizableIcon = {
  iconSize?: number;
};

const DEFAULT_SIZE = 28;

const StyledIconButton = styled(IconButton)<SizableIcon>`
  min-width: ${({ iconSize }) => iconSize ?? DEFAULT_SIZE}px;
  min-height: ${({ iconSize }) => iconSize ?? DEFAULT_SIZE}px;
`;

export const MenuButton = ({ color, onClick, ariaLabel, size, ...restProps }: MenuButtonProps) => {
  const getHoverColor = useCallback(() => {
    return getSlightlyDifferentColor(color ?? '', undefined, 0.1);
  }, [color]);

  return (
    <StyledIconButton
      iconSize={size}
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

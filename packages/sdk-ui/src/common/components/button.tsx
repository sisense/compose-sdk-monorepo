import { ReactNode } from 'react';
import ButtonMui from '@mui/material/Button';
import { useThemeContext } from '@/theme-provider';
import { getSlightlyDifferentColor } from '@/utils/color';

type ButtonProps = {
  children: ReactNode;
  type?: 'primary' | 'secondary';
  disabled?: boolean;
  onClick?: () => void;
};

const SECONDARY_BUTTON_BACKGROUND_COLOR = '#edeef1';
const BUTTON_TEXT_COLOR = '#3a4356';

/** @internal */
export const Button = (props: ButtonProps) => {
  const { themeSettings } = useThemeContext();
  const { children, type = 'primary', disabled, onClick, ...restProps } = props;
  return (
    <ButtonMui
      variant="contained"
      sx={{
        backgroundColor:
          type === 'primary' ? themeSettings.general.brandColor : SECONDARY_BUTTON_BACKGROUND_COLOR,
        color: BUTTON_TEXT_COLOR,
        width: '74px',
        height: '28px',
        lineHeight: '18px',
        borderRadius: '4px',
        fontWeight: 400,
        fontSize: '13px',
        textTransform: 'none',
        boxShadow: 'none',
        '&:hover': {
          backgroundColor:
            type === 'primary'
              ? getSlightlyDifferentColor(themeSettings.general.brandColor, 0.1)
              : getSlightlyDifferentColor(SECONDARY_BUTTON_BACKGROUND_COLOR, 0.1),
          boxShadow: 'none',
        },
        '&[disabled]': {
          backgroundColor:
            type === 'primary'
              ? themeSettings.general.brandColor
              : SECONDARY_BUTTON_BACKGROUND_COLOR,
          color: BUTTON_TEXT_COLOR,
          opacity: 0.4,
        },
      }}
      onClick={onClick}
      disabled={disabled}
      {...restProps}
    >
      {children}
    </ButtonMui>
  );
};

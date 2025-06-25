import { ReactNode } from 'react';
import ButtonMui from '@mui/material/Button';
import { useThemeContext } from '@/theme-provider';
import { getSlightlyDifferentColor } from '@/utils/color';
import { ElementStates } from '@/types';
import { getElementStateColor } from '@/theme-provider/utils';

type ButtonProps = {
  children: ReactNode;
  type?: 'primary' | 'secondary';
  disabled?: boolean;
  onClick?: () => void;
  title?: string;
};

const BUTTON_TEXT_COLOR = '#3a4356';

/** @internal */
export const Button = (props: ButtonProps) => {
  const { themeSettings } = useThemeContext();
  const theme = themeSettings.general.buttons;
  const { children, type = 'primary', disabled, onClick, title, ...restProps } = props;
  return (
    <ButtonMui
      variant="contained"
      sx={{
        backgroundColor:
          type === 'primary'
            ? themeSettings.general.brandColor
            : getElementStateColor(theme.cancel.backgroundColor, ElementStates.DEFAULT),
        color: type === 'primary' ? BUTTON_TEXT_COLOR : theme.cancel.textColor,
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
              : getElementStateColor(theme.cancel.backgroundColor, ElementStates.HOVER),
          boxShadow: 'none',
        },
        '&:focus': {
          backgroundColor:
            type === 'primary'
              ? getSlightlyDifferentColor(themeSettings.general.brandColor, 0.1)
              : getElementStateColor(theme.cancel.backgroundColor, ElementStates.FOCUS),
        },
        '&[disabled]': {
          backgroundColor:
            type === 'primary'
              ? themeSettings.general.brandColor
              : getElementStateColor(theme.cancel.backgroundColor, ElementStates.DEFAULT),
          color: type === 'primary' ? BUTTON_TEXT_COLOR : theme.cancel.textColor,
          opacity: 0.4,
        },
      }}
      onClick={onClick}
      disabled={disabled}
      title={title}
      {...restProps}
    >
      {children}
    </ButtonMui>
  );
};

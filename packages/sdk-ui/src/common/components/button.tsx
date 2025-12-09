import { ReactNode } from 'react';

import ButtonMui from '@mui/material/Button';

import { useThemeContext } from '@/theme-provider';
import { getElementStateColor, isElementStateColors } from '@/theme-provider/utils';
import { ElementStates } from '@/types';
import { getSlightlyDifferentColor } from '@/utils/color';

type ButtonProps = {
  children: ReactNode;
  type?: 'primary' | 'secondary';
  disabled?: boolean;
  onClick?: () => void;
  title?: string;
};

/** @internal */
export const Button = (props: ButtonProps) => {
  const { themeSettings } = useThemeContext();
  const buttons = themeSettings.general.buttons;
  const { children, type = 'primary', disabled, onClick, title, ...restProps } = props;
  return (
    <ButtonMui
      variant="contained"
      sx={{
        backgroundColor:
          type === 'primary'
            ? getElementStateColor(buttons.primary?.backgroundColor, ElementStates.DEFAULT)
            : getElementStateColor(buttons.cancel?.backgroundColor, ElementStates.DEFAULT),
        color: type === 'primary' ? buttons.primary?.textColor : buttons.cancel?.textColor,
        width: '74px',
        height: '28px',
        lineHeight: '18px',
        borderRadius: '4px',
        fontWeight: 400,
        fontSize: '13px',
        fontFamily: themeSettings.typography.fontFamily,
        textTransform: 'none',
        boxShadow: 'none',
        '&:hover': {
          backgroundColor:
            type === 'primary'
              ? isElementStateColors(buttons.primary?.backgroundColor)
                ? getElementStateColor(buttons.primary?.backgroundColor, ElementStates.HOVER)
                : getSlightlyDifferentColor(buttons.primary?.backgroundColor, 0.1)
              : isElementStateColors(buttons.cancel?.backgroundColor)
              ? getElementStateColor(buttons.cancel?.backgroundColor, ElementStates.HOVER)
              : getSlightlyDifferentColor(buttons.cancel?.backgroundColor, 0.1),
          boxShadow: 'none',
        },
        '&:focus': {
          backgroundColor:
            type === 'primary'
              ? isElementStateColors(buttons.primary?.backgroundColor)
                ? getElementStateColor(buttons.primary?.backgroundColor, ElementStates.FOCUS)
                : getSlightlyDifferentColor(buttons.primary?.backgroundColor, 0.1)
              : isElementStateColors(buttons.cancel?.backgroundColor)
              ? getElementStateColor(buttons.cancel?.backgroundColor, ElementStates.FOCUS)
              : getSlightlyDifferentColor(buttons.cancel?.backgroundColor, 0.1),
        },
        '&[disabled]': {
          backgroundColor:
            type === 'primary'
              ? getElementStateColor(buttons.primary?.backgroundColor, ElementStates.DEFAULT)
              : getElementStateColor(buttons.cancel?.backgroundColor, ElementStates.DEFAULT),
          color: type === 'primary' ? buttons.primary?.textColor : buttons.cancel?.textColor,
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

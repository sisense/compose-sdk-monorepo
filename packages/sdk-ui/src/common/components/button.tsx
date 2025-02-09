import { ReactNode } from 'react';
import ButtonMui from '@mui/material/Button';

type ButtonProps = {
  children: ReactNode;
  type?: 'primary' | 'secondary';
  disabled?: boolean;
  onClick?: () => void;
};

/** @internal */
export const Button = (props: ButtonProps) => {
  const { children, type = 'primary', disabled, onClick, ...restProps } = props;
  return (
    <ButtonMui
      variant="contained"
      sx={{
        backgroundColor: type === 'primary' ? '#ffcb05' : '#edeef1',
        color: '#3a4356',
        width: '74px',
        height: '28px',
        lineHeight: '18px',
        borderRadius: '4px',
        fontWeight: 400,
        fontSize: '13px',
        textTransform: 'none',
        boxShadow: 'none',
        '&:hover': {
          backgroundColor: type === 'primary' ? '#f2b900' : '#d0d3db',
          boxShadow: 'none',
        },
        '&[disabled]': {
          backgroundColor: type === 'primary' ? '#ffcb05' : '#edeef1',
          color: '#3a4356',
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

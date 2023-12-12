/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { styled } from '@mui/material';
import type { FunctionComponent, InputHTMLAttributes } from 'react';

type RadioProps = { label?: string } & InputHTMLAttributes<HTMLInputElement>;

export const Radio: FunctionComponent<RadioProps> = (props) => {
  return (
    <label>
      <input
        {...props}
        className={
          'csdk-accent-UI-default csdk-text-UI-default  csdk-w-radio csdk-h-radio csdk-m-radio ' +
          props.className
        }
        type={'radio'}
      />
      {props.label}
    </label>
  );
};

const StyledDiv = styled('div')({
  '::-webkit-scrollbar': {
    width: '8px',
    height: '8px',
  },
  '::-webkit-scrollbar-track': {
    backgroundColor: 'transparent',
  },
  '::-webkit-scrollbar-thumb': {
    backgroundColor: '#c2c2c2',
    borderRadius: '4px',
    border: `1px solid transparent`,
    backgroundClip: 'content-box',
    minHeight: '20px',
    minWidth: '20px',
  },
  '::-webkit-scrollbar-thumb:hover': {
    backgroundColor: '#7d7d7d',
    border: `none`,
  },
});

export type RadioGroupProps = {
  items: string[];
  currentSelection?: string;
  title?: string;
  className?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export const RadioGroup: FunctionComponent<RadioGroupProps> = ({
  items,
  currentSelection,
  title,
  className,
  ...props
}) => {
  return (
    <StyledDiv className={className}>
      <div className="csdk-ml-1.5">{title}</div>
      {items.map((item, i) => (
        <Radio key={i} value={item} label={item} checked={item === currentSelection} {...props} />
      ))}
    </StyledDiv>
  );
};

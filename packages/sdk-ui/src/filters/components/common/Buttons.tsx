import Tooltip from '@mui/material/Tooltip';
import { forwardRef, type ButtonHTMLAttributes, type FunctionComponent } from 'react';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;
export const PrimaryButton: FunctionComponent<ButtonProps> = (props) => {
  return (
    <button
      {...props}
      className={
        'rounded   disabled:cursor-not-allowed leading-none font-normal text-text-content  p-button bg-primary-primary h-button hover:bg-interaction-primaryHovered disabled:opacity-30 ' +
        (props.className || '')
      }
    >
      {props.children}
    </button>
  );
};

export const SecondaryButton: FunctionComponent<ButtonProps> = forwardRef<
  HTMLButtonElement,
  ButtonProps
>((props, ref) => {
  return (
    <button
      {...props}
      ref={ref}
      className={
        'rounded disabled:cursor-not-allowed leading-none font-normal text-text-content  p-button bg-secondary-default h-button hover:bg-secondary-hover disabled:opacity-30 ' +
        (props.className || '')
      }
    >
      {props.children}
    </button>
  );
});

export type ButtonWithTooltipProps = ButtonProps & {
  tooltipTitle: string;
  disableTooltip: boolean;
};

export const SecondaryButtonWithTooltip: FunctionComponent<ButtonWithTooltipProps> = (props) => {
  const { tooltipTitle, disableTooltip, children, disabled, ...buttonProps } = props;
  return (
    <Tooltip title={tooltipTitle} disableHoverListener={disableTooltip}>
      <span>
        <SecondaryButton
          disabled={disabled}
          style={
            disabled ? { ...(buttonProps.style || {}), pointerEvents: 'none' } : buttonProps.style
          }
          {...buttonProps}
        >
          {children}
        </SecondaryButton>
      </span>
    </Tooltip>
  );
};

export const LinkButton: FunctionComponent<ButtonProps> = (props) => {
  return (
    <button
      {...props}
      style={{
        background: 'none',
      }}
      className={'text-xs text-text-linkButton ' + (props.className || '')}
    >
      {props.children}
    </button>
  );
};

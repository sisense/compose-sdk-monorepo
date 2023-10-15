import Tooltip from '@mui/material/Tooltip';
import { forwardRef, type ButtonHTMLAttributes, type FunctionComponent } from 'react';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;
export const PrimaryButton: FunctionComponent<ButtonProps> = (props) => {
  return (
    <button
      {...props}
      className={
        'csdk-rounded   disabled:csdk-cursor-not-allowed csdk-leading-none csdk-font-normal csdk-text-text-content  csdk-p-button csdk-bg-primary-primary csdk-h-button hover:csdk-bg-interaction-primaryHovered disabled:csdk-opacity-30 ' +
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
        'csdk-rounded disabled:csdk-cursor-not-allowed csdk-leading-[18px] csdk-text-[13px] csdk-py-[5px] csdk-px-[8px] csdk-text-text-content disabled:csdk-opacity-30 ' +
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
      className={'csdk-text-xs csdk-text-text-linkButton ' + (props.className || '')}
    >
      {props.children}
    </button>
  );
};

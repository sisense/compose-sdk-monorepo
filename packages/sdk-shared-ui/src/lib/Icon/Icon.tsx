import { IconProps as MuiIconProps } from '@mui/material/Icon';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import SvgIcon from '@mui/material/SvgIcon';
import classNames from 'classnames';
import React, { type ForwardedRef, forwardRef } from 'react';

import { EmotionCacheProvider } from '../common/emotion-cache-provider';
import { iconTheme } from './themes';

export type IconProps = {
  className?: string;
  name: string;
  title?: string;
  dataTestId?: string;
  disabled?: boolean;
} & MuiIconProps &
  React.HTMLAttributes<HTMLSpanElement>;

const SisenseSvgIcon = (props: IconProps) => {
  const { name, sx } = props;
  const svgClassName = classNames('app-icon__svg');
  return (
    <SvgIcon classes={{ root: svgClassName }} sx={sx} inheritViewBox={true}>
      <use xlinkHref={`#${name}`} />
      <symbol id="general-arrow-big-down" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M7.589 10L7 10.777 11.99 15 17 10.777 16.413 10l-4.422 3.727z"
        ></path>
      </symbol>
      <symbol id="general-arrow-left" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M13.878 9.325a.5.5 0 1 0-.76-.65l-2.998 3.5a.5.5 0 0 0 0 .65l2.999 3.5a.5.5 0 1 0 .76-.65l-2.72-3.175 2.72-3.175z"
        ></path>
      </symbol>

      <symbol id="general-arrow-long-right" viewBox="0 0 29 8">
        <path
          d="M28.354 4.354a.5.5 0 0 0 0-.708L25.172.464a.5.5 0 1 0-.707.708L27.293 4l-2.828 2.828a.5.5 0 1 0 .707.708l3.182-3.182zM0 4.5h28v-1H0v1z"
          fill="#3A4356"
        ></path>
      </symbol>

      <symbol id="general-arrow-right" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M13.34 12.5l-2.72-3.175a.5.5 0 1 1 .76-.65l2.998 3.5a.5.5 0 0 1 0 .65l-2.998 3.5a.5.5 0 1 1-.76-.65l2.72-3.175z"
        ></path>
      </symbol>

      <symbol id="general-arrow-up" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M12 10.16l-3.174 2.719a.5.5 0 0 1-.65-.76l3.5-2.998a.5.5 0 0 1 .65 0l3.5 2.998a.5.5 0 1 1-.65.76L12 10.159z"
        ></path>
      </symbol>

      <symbol id="general-arrow-up-down" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M15.646 14.646a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L12 18.293l3.646-3.647zm0-5.292L12 5.707 8.354 9.354a.5.5 0 1 1-.708-.708l4-4a.5.5 0 0 1 .708 0l4 4a.5.5 0 0 1-.708.708z"
        ></path>
      </symbol>

      <symbol id="general-double-arrow-back" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M9.658 12.5l2.72 3.175a.5.5 0 1 1-.76.65l-2.998-3.5a.5.5 0 0 1 0-.65l2.999-3.5a.5.5 0 1 1 .76.65L9.658 12.5zm5.719-3.175l-2.72 3.175 2.72 3.175a.5.5 0 1 1-.76.65l-2.998-3.5a.5.5 0 0 1 0-.65l2.998-3.5a.5.5 0 1 1 .76.65z"
        ></path>
      </symbol>

      <symbol id="general-double-arrow-front" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M11.34 12.5L8.62 9.325a.5.5 0 0 1 .76-.65l2.998 3.5a.5.5 0 0 1 0 .65l-2.998 3.5a.5.5 0 1 1-.76-.65l2.72-3.175zm.279-3.175a.5.5 0 0 1 .76-.65l2.998 3.5a.5.5 0 0 1 0 .65l-2.999 3.5a.5.5 0 1 1-.76-.65l2.72-3.175-2.72-3.175z"
        ></path>
      </symbol>

      <symbol id="general-double-big-arrow-back" viewBox="0 0 31 31">
        <g fill="currentColor">
          <path d="M16 11.825l-3.842 4.297 3.662 4.087a.5.5 0 1 1-.76.65l-3.94-4.412a.5.5 0 0 1 0-.65l4.12-4.622a.5.5 0 1 1 .76.65zm5 0l-3.842 4.297 3.662 4.087a.5.5 0 1 1-.76.65l-3.94-4.412a.5.5 0 0 1 0-.65l4.12-4.622a.5.5 0 1 1 .76.65z"></path>
          <path d="M10 11.5a.5.5 0 0 1 1 0v9a.5.5 0 0 1-1 0v-9z"></path>
        </g>
      </symbol>

      <symbol id="general-double-big-arrow-front" viewBox="0 0 31 31">
        <g fill="currentColor">
          <path d="M15 20.175l3.842-4.297-3.662-4.087a.5.5 0 1 1 .76-.65l3.94 4.412a.5.5 0 0 1 0 .65l-4.12 4.622a.5.5 0 1 1-.76-.65zm-5 0l3.842-4.297-3.662-4.087a.5.5 0 1 1 .76-.65l3.94 4.412a.5.5 0 0 1 0 .65l-4.12 4.622a.5.5 0 1 1-.76-.65z"></path>
          <path d="M21 20.5a.5.5 0 0 1-1 0v-9a.5.5 0 0 1 1 0v9z"></path>
        </g>
      </symbol>

      <symbol id="general-x" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M12 12.293L6.854 7.146a.5.5 0 1 0-.708.708L11.293 13l-5.147 5.146a.5.5 0 0 0 .708.708L12 13.707l5.146 5.147a.5.5 0 0 0 .708-.708L12.707 13l5.147-5.146a.5.5 0 0 0-.708-.708L12 12.293z"
        ></path>
      </symbol>

      <symbol id="header-doc" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M14 5.562V10h3.698L14 5.562zM18 11h-5V5H7a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-8zm1-1v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7l5 6zm-7 5.84l3.174-2.719a.5.5 0 0 1 .65.76l-3.5 2.998a.5.5 0 0 1-.65 0l-3.5-2.998a.5.5 0 1 1 .65-.76L12 15.841z"
        ></path>
      </symbol>

      <symbol id="general-arrow-down" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M12 13.84l3.174-2.719a.5.5 0 0 1 .65.76l-3.5 2.998a.5.5 0 0 1-.65 0l-3.5-2.998a.5.5 0 1 1 .65-.76L12 13.841z"
        ></path>
      </symbol>

      <symbol id="general-plus" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M12 12V7.5a.5.5 0 1 0-1 0V12H6.5a.5.5 0 1 0 0 1H11v4.5a.5.5 0 1 0 1 0V13h4.5a.5.5 0 1 0 0-1H12z"
        ></path>
      </symbol>
    </SvgIcon>
  );
};

const Icon = forwardRef((props: IconProps, ref: ForwardedRef<HTMLSpanElement>) => {
  const { dataTestId, name, className } = props;
  const returnedIconComponent = <SisenseSvgIcon {...props} />;
  const iconClassName = classNames('app-icon', `app-icon--${name}`, className);

  return (
    <EmotionCacheProvider>
      <ThemeProvider theme={iconTheme}>
        <span data-testid={dataTestId} {...props} ref={ref} className={iconClassName}>
          {returnedIconComponent}
        </span>
      </ThemeProvider>
    </EmotionCacheProvider>
  );
});

export default Icon;
export { Icon };

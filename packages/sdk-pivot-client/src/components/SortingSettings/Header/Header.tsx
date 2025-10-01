import React, { MouseEventHandler } from 'react';

import { Icon } from '@ethings-os/sdk-shared-ui/Icon';

import { HeaderText } from './HeaderText.js';

type Props = {
  onCrossIconClick?: MouseEventHandler<HTMLSpanElement>;
  className: string;
} & Parameters<typeof HeaderText>[0];

export const Header = (props: Props) => {
  const { onCrossIconClick, className, prependedText, hierarchy } = props;

  const shouldShowCrossIcon = Boolean(onCrossIconClick);

  return (
    <div className={className}>
      <HeaderText hierarchy={hierarchy} prependedText={prependedText} />
      {shouldShowCrossIcon && (
        <Icon onClick={onCrossIconClick} name="general-x" className="cross-icon" />
      )}
    </div>
  );
};

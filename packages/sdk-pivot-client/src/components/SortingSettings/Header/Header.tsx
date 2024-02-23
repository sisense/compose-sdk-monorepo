import React, { MouseEventHandler } from 'react';

import { HeaderText } from './HeaderText.js';

// eslint-disable-next-line @typescript-eslint/no-var-requires
// const { Icon } = require('@sisense/shared-ui-components');
import { Icon } from '../../../shared-ui-components/Icon';

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

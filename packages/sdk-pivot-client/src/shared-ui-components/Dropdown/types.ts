import React from 'react';

import { Input } from '../Input';

export type DropdownInputProps = Pick<
  React.ComponentProps<typeof Input>,
  'onChange' | 'value' | 'search' | 'onClicked'
>;

export type DropdownItem = {
  id: string;
  caption: string;
  iconName?: string;
  iconClass?: string;
  tooltip?: string | React.ReactFragment;
  disabled?: boolean;
};

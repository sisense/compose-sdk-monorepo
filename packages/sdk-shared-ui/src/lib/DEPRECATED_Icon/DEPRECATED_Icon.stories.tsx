import React from 'react';

import { DEPRECATED_Icon } from './DEPRECATED_Icon';

export default {
  title: 'DEPRECATED/Icon',
};

export const GeneralArrowDown = () => <DEPRECATED_Icon name={'general-arrow-down'} />;

export const GeneralArrowDownDisabled = () => (
  <DEPRECATED_Icon name={'general-arrow-down'} disabled />
);

export const GeneralArrowDownClickable = () => (
  <DEPRECATED_Icon name={'general-arrow-down'} onClick={() => {}} />
);

export const GeneralViSmallWhite = () => <DEPRECATED_Icon name={'general-vi-small-white'} />;

export const GeneralViSmallWhiteDisabled = () => (
  <DEPRECATED_Icon name={'general-vi-small-white'} disabled />
);

export const GeneralViSmallWhiteClickable = () => (
  <DEPRECATED_Icon name={'general-vi-small-white'} onClick={() => {}} />
);

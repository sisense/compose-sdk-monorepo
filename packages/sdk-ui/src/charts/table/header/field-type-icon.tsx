import React from 'react';

import { isBoolean, isDatetime, isNumber, isText } from '@sisense/sdk-data';
import classnames from 'classnames';

import styles from '../styles/field-type-icon.module.scss';

type Props = {
  columnType: string;
};

export const FieldTypeIcon = ({ columnType }: Props) => {
  return (
    <div
      className={classnames(styles.icon, {
        [styles.numberIcon]: isNumber(columnType),
        [styles.dateIcon]: isDatetime(columnType),
        [styles.textIcon]: isText(columnType),
        [styles.booleanIcon]: isBoolean(columnType),
      })}
    />
  );
};

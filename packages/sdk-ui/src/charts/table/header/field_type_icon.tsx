import React from 'react';
import styles from '../styles/field_type_icon.module.scss';
import classnames from 'classnames';
import { isBoolean, isDatetime, isNumber, isText } from '@sisense/sdk-data';

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

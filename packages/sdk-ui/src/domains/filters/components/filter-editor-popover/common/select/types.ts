import { type ReactNode } from 'react';

export type Focusable = {
  focus?: boolean;
};

export type SelectItem<Value> = {
  value: Value;
  displayValue?: string;
  icon?: ReactNode;
};

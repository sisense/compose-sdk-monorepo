import type { FunctionComponent } from 'react';

type RadioProps = { label?: string; checked: boolean; onChange: () => void };

export const Radio: FunctionComponent<RadioProps> = (props) => {
  const { label, checked, onChange } = props;
  return (
    <label>
      <input
        checked={checked}
        onChange={onChange}
        className="csdk-accent-UI-default csdk-text-UI-default  csdk-w-radio csdk-h-radio csdk-m-radio"
        type="radio"
      />
      {label}
    </label>
  );
};

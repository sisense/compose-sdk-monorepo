/* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable @typescript-eslint/restrict-plus-operands */
import {
  createRef,
  type FunctionComponent,
  type InputHTMLAttributes,
  useEffect,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import { SearchIcon } from '@/common/icons/search-icon';

type InputProps = {
  variant?: 'white' | 'grey';
  label: string;
} & InputHTMLAttributes<HTMLInputElement>;

export const Input: FunctionComponent<InputProps> = (props) => {
  const { t } = useTranslation();
  const [isValid, setIsValid] = useState(true);
  const inputRef = createRef<HTMLInputElement>();
  const grey = 'csdk-bg-background-priority ';
  const white = 'csdk-bg-white ';
  const variant = props.variant === 'white' ? white : grey;
  const defaultClass =
    'csdk-outline-0  csdk-border-none  csdk-p-input csdk-h-button  csdk-rounded-md ';

  const invalid =
    'invalid:csdk-border-semantic-error invalid:csdk-border-input invalid:csdk-border-solid ';
  const disabled = 'disabled:csdk-placeholder:opacity-30 disabled:csdk-cursor-not-allowed ';

  const focus = 'focus:csdk-border-solid focus:csdk-border-input focus:csdk-border-UI-default ';
  const hover = 'hover:csdk-border-2 hover:csdk-border-guiding csdk-text-text-active ';

  useEffect(() => {
    if (inputRef.current) {
      setIsValid(inputRef.current.checkValidity());
    }
  });

  return (
    <div className={'csdk-relative csdk-grid csdk-grid-cols-1 csdk-gap-2'}>
      {props.label && (
        <label htmlFor={props.id} className={'csdk-text-text-content'}>
          {props.label}
        </label>
      )}
      <div className="csdk-relative csdk-h-button">
        <div className="csdk-absolute csdk-left-2 csdk-top-1/2 csdk-transform -csdk-translate-y-1/2 ">
          <SearchIcon className=" csdk-text-text-active" aria-hidden="true" />
        </div>
        <input
          ref={inputRef}
          {...props}
          className={
            defaultClass + invalid + disabled + focus + hover + variant + 'pl-10 ' + props.className
          }
        />
      </div>
      <small className={'csdk-text-semantic-error csdk-min-h-[20px]'}>
        {isValid ? '' : t('errors.invalidInput')}
      </small>
    </div>
  );
};

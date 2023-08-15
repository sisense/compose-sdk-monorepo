/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
import {
  createRef,
  useEffect,
  useState,
  type FunctionComponent,
  type InputHTMLAttributes,
} from 'react';
import { SearchIcon } from '../icons';

type InputProps = {
  variant?: 'white' | 'grey';
  label: string;
} & InputHTMLAttributes<HTMLInputElement>;

export const Input: FunctionComponent<InputProps> = (props) => {
  const [isValid, setIsValid] = useState(true);
  const inputRef = createRef<HTMLInputElement>();
  const grey = 'bg-background-priority ';
  const white = 'bg-white ';
  const variant = props.variant === 'white' ? white : grey;
  const defaultClass = 'outline-0  border-none  p-input h-button  rounded-md ';

  const invalid = 'invalid:border-semantic-error invalid:border-input invalid:border-solid ';
  const disabled = 'disabled:placeholder:opacity-30 disabled:cursor-not-allowed ';

  const focus = 'focus:border-solid focus:border-input focus:border-UI-default ';
  const hover = 'hover:border-2 hover:border-guiding text-text-active ';

  useEffect(() => {
    if (inputRef.current) {
      setIsValid(inputRef.current.checkValidity());
    }
  });

  return (
    <div className={'relative grid grid-cols-1 gap-2'}>
      {props.label && (
        <label htmlFor={props.id} className={'text-text-content'}>
          {props.label}
        </label>
      )}
      <div className="relative h-button">
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 ">
          <SearchIcon className=" text-text-active" aria-hidden="true" />
        </div>
        <input
          ref={inputRef}
          {...props}
          className={
            defaultClass + invalid + disabled + focus + hover + variant + 'pl-10 ' + props.className
          }
        />
      </div>
      <small className={'text-semantic-error min-h-[20px]'}>
        {isValid ? '' : 'Error message goes here'}
      </small>
    </div>
  );
};

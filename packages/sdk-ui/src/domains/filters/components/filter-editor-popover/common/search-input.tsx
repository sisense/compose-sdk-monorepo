import { CSSProperties } from 'react';

import { SearchIcon } from '@/shared/icons/search-icon';

import { Input } from './input.js';

type SearchInputProps = {
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  style?: CSSProperties;
  inputStyle?: CSSProperties;
  inputRef?: (input: HTMLInputElement) => void;
  className?: string;
};

export const SearchInput = (props: SearchInputProps) => {
  const { placeholder, onChange, value, inputRef, inputStyle, style, className, ...restProps } =
    props;

  return (
    /* The icon is positioned against this box, so the box has to be a containing block. Its
       `position` is left to the caller rather than set inline: the search overlay in the
       searchable selects is a `styled(SearchInput)` that positions this box `absolute` over
       the trigger, and an inline `position` here would outrank that class and drop the
       overlay back into the flow. */
    <div className={className} style={style}>
      <span
        style={{
          position: 'absolute',
          top: '50%',
          left: '6px',
          transform: 'translateY(-50%)',
          zIndex: 2,
          display: 'inline-flex',
        }}
      >
        <SearchIcon aria-label="search-icon" color={style?.color ?? '#5B6372'} opacity="40%" />
      </span>
      <Input
        inputRef={inputRef}
        placeholder={placeholder}
        onChange={onChange}
        value={value}
        wrapperStyle={{ width: '100%', height: '100%' }}
        style={{
          paddingLeft: '28px',
          paddingRight: '16px',
          width: '100%',
          ...inputStyle,
        }}
        {...restProps}
      />
    </div>
  );
};

import { SearchIcon } from '@/common/icons/search-icon';
import { CSSProperties } from 'react';
import { Input } from './input';

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
    <div className={className} style={style}>
      <span style={{ position: 'absolute', top: '3px', left: '6px', zIndex: 2 }}>
        <SearchIcon aria-label="search-icon" color={style?.color ?? '#5B6372'} opacity="40%" />
      </span>
      <Input
        inputRef={inputRef}
        placeholder={placeholder}
        onChange={onChange}
        value={value}
        wrapperStyle={{ width: '100%' }}
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

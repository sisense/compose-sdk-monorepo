import { CSSProperties } from 'react';
import { Input } from './input';
import { SearchIcon } from '../../icons';

type SearchInputProps = {
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  style?: CSSProperties;
};

export const SearchInput = (props: SearchInputProps) => {
  const { placeholder, onChange, style, ...restProps } = props;
  return (
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', top: '3px', left: '6px' }}>
        <SearchIcon aria-label="search-icon" color="#5B6372" opacity="40%" />
      </span>
      <Input
        placeholder={placeholder}
        onChange={onChange}
        style={{
          paddingLeft: '28px',
          paddingRight: '16px',
          ...style,
        }}
        {...restProps}
      />
    </div>
  );
};

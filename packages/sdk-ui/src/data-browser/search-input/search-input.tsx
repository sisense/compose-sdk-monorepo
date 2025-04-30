import { useDebouncedValue } from '@/common/hooks/use-debounced-value';
import { CloseIcon } from '@/common/icons/close-icon';
import { SearchIcon } from '@/common/icons/search-icon';
import { useThemeContext } from '@/theme-provider';
import { Themable } from '@/theme-provider/types';
import { getElementStateColor } from '@/theme-provider/utils';
import { ElementStates } from '@/types';
import styled from '@emotion/styled';
import IconButton from '@mui/material/IconButton';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type SearchInputProps = {
  onChange: (value: string) => void;
  initialValue?: string;
};

const SEARCH_DEBOUNCE_TIME = 300; // ms

export const SearchInput = (props: SearchInputProps) => {
  const { t } = useTranslation();
  const { themeSettings } = useThemeContext();
  const { onChange, initialValue } = props;
  const [inputValue, setSearchInputValue] = useState(initialValue || '');
  const debouncedSearchValue = useDebouncedValue(inputValue, SEARCH_DEBOUNCE_TIME);

  useEffect(() => {
    onChange(debouncedSearchValue);
  }, [debouncedSearchValue, onChange]);

  const isClearButtonVisible = inputValue && inputValue.length > 0;
  const clearInput = useCallback(() => setSearchInputValue(''), []);
  return (
    <SearchInputContainer theme={themeSettings}>
      <SearchIcon />
      <Input
        placeholder={t('dataBrowser.searchPlaceholder')}
        value={inputValue}
        onChange={(e) => setSearchInputValue(e.target.value)}
        theme={themeSettings}
      />
      {isClearButtonVisible && <ClearButton onClick={clearInput} />}
    </SearchInputContainer>
  );
};

const SearchInputContainer = styled.div<Themable>`
  display: flex;
  height: 28px;
  padding: 5px 8px;
  align-items: center;
  gap: 4px;
  align-self: stretch;
  border-radius: 4px;
  color: ${({ theme }) => theme.general.popover.input.textColor};
  svg path {
    fill: ${({ theme }) => theme.general.popover.input.textColor};
  }
  background-color: ${({ theme }) => theme.general.popover.input.backgroundColor};
  border-color: ${({ theme }) =>
    getElementStateColor(theme.general.popover.input.borderColor, ElementStates.DEFAULT)};

  :focus-within {
    outline: -webkit-focus-ring-color auto 1px;
  }
  & input:focus-visible {
    outline: none;
  }
`;

const Input = styled.input<Themable>`
  border: none;
  outline: none;
  flex: 1;
  color: ${({ theme }) => theme.general.popover.input.textColor};
  background-color: ${({ theme }) => theme.general.popover.input.backgroundColor};
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: 18px;
  ::placeholder {
    color: inherit;
    opacity: 0.5;
  }
`;

const ClearButton = (props: { onClick?: () => void }) => {
  const { themeSettings } = useThemeContext();
  return (
    <CloseIconButton
      onClick={props.onClick}
      data-testid="popover-close-button"
      theme={themeSettings}
    >
      <CloseIcon />
    </CloseIconButton>
  );
};

const CloseIconButton = styled(IconButton)<Themable>`
  padding: 0;
  width: 24;
  height: 24;

  svg path {
    fill: ${({ theme }) => theme.general.popover.input.textColor};
  }
`;

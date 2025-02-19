import styled from '@emotion/styled';
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_TEXT_COLOR } from '@/const';

export const Input = styled.input`
  box-sizing: border-box;
  border-radius: 4px;
  outline: none;
  background: ${DEFAULT_BACKGROUND_COLOR};
  color: #5b6372;
  line-height: 28px;
  height: 28px;
  border: none;
  text-indent: 8px;
  font-family: inherit;
  padding-right: 8px;
  border: 1px solid ${DEFAULT_BACKGROUND_COLOR};

  &:focus {
    border: 1px solid ${DEFAULT_TEXT_COLOR};
  }

  &::placeholder {
    color: inherit;
    opacity: 0.5;
  }
`;

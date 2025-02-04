import styled from '@emotion/styled';

export const Input = styled.input`
  box-sizing: border-box;
  border-radius: 4px;
  outline: none;
  background: #f4f4f8;
  color: #5b6372;
  line-height: 28px;
  height: 28px;
  border: none;
  text-indent: 8px;
  font-family: inherit;
  padding-right: 8px;
  border: 1px solid #f4f4f8;

  &:focus {
    border: 1px solid #5b6372;
  }

  &::placeholder {
    color: inherit;
    opacity: 0.5;
  }
`;

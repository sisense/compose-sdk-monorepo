import styled from '@emotion/styled';

import { Themable } from '@/theme-provider/types';

export const FilterEditorContainer = styled.div<Themable>`
  display: flex;
  flex-direction: column;
  padding: 20px 16px 16px 40px;
  justify-content: space-around;
  align-items: stretch;
  font-size: 13px;
  color: ${({ theme }) => theme.general.popover.content.textColor};
`;

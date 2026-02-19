import { Themable } from '@/infra/contexts/theme-provider/types';
import styled from '@/infra/styled';

export const FilterEditorContainer = styled.div<Themable>`
  display: flex;
  flex-direction: column;
  padding: 20px 16px 16px 40px;
  justify-content: space-around;
  align-items: stretch;
  font-size: 13px;
  color: ${({ theme }) => theme.general.popover.content.textColor};
`;

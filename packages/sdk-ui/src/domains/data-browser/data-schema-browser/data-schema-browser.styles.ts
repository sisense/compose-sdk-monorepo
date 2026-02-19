import { Themable } from '@/infra/contexts/theme-provider/types.js';
import styled from '@/infra/styled';

export const DimensionsBrowserContainer = styled.div<Themable>`
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 16px 24px;
  gap: 16px;
  background: ${({ theme }) => theme.general.popover.content.backgroundColor};
  color: ${({ theme }) => theme.general.popover.content.textColor};
  svg path {
    fill: ${({ theme }) => theme.general.popover.content.textColor};
  }
`;

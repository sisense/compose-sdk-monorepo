import styled from '@/styled';
import { Themable } from '@/theme-provider/types.js';

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

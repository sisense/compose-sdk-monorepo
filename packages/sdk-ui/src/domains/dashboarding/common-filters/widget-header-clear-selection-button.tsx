import React from 'react';
import { useTranslation } from 'react-i18next';

import { useThemeContext } from '@/infra/contexts/theme-provider';
import { Themable } from '@/infra/contexts/theme-provider/types';
import styled from '@/infra/styled';

const ClearSelectionButton = styled.button<Themable>`
  color: ${({ theme }) => theme.chart?.textColor};
  background: none;
  font-size: 13px;
  border: none;
  height: 26px;
  padding: 0 6px 0 2px;
  margin: 0 4px 0 4px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background-color: rgba(247, 247, 247, 1);
  }
`;

const ClearSelectionText = styled.span<Themable>`
  color: ${({ theme }) => theme.chart?.textColor};
  display: inline-block;
  padding-top: 3px;
  white-space: nowrap;
`;

export const WidgetHeaderClearSelectionButton = ({ onClick }: { onClick: () => void }) => {
  const { themeSettings } = useThemeContext();
  const { t } = useTranslation();
  return (
    <ClearSelectionButton onClick={onClick} theme={themeSettings}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
        <path
          fill={themeSettings.chart?.textColor}
          d="M7.187 7l9.774 10.279A1 1 0 0 0 17 17V8a1 1 0 0 0-1-1H7.187zm9.018 10.979L6.206 7.463l.487-.415A1 1 0 0 0 6 8v9a1 1 0 0 0 1 1h9c.07 0 .139-.007.205-.021zM7 6h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"
        />
      </svg>
      <ClearSelectionText theme={themeSettings}>
        {t('commonFilter.clearSelectionButton')}
      </ClearSelectionText>
    </ClearSelectionButton>
  );
};

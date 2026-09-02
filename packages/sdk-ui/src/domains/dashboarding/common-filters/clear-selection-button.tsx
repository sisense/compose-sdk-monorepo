import React from 'react';
import { useTranslation } from 'react-i18next';

import styled from '@emotion/styled';

import { asBuiltInHeaderItem, HeaderItem } from '@/domains/shared/header';
import { WidgetHeaderTargets } from '@/domains/widgets/shared/widget-header/widget-header-targets';
import { useThemeContext } from '@/infra/contexts/theme-provider';
import { Themable } from '@/infra/contexts/theme-provider/types';

const StyledClearSelectionButton = styled.button<Themable>`
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

/**
 * Renders the "clear selection" button, contributed to a widget header as the built-in
 * {@link WidgetHeaderTargets.ClearSelectionButton} item while the widget has a common-filter
 * selection to clear.
 *
 * @param props - Component props.
 * @param props.onClick - Clears the widget's common-filter selection.
 * @returns The button element.
 */
export const ClearSelectionButton = ({ onClick }: { onClick: () => void }) => {
  const { themeSettings } = useThemeContext();
  const { t } = useTranslation();
  return (
    <StyledClearSelectionButton
      onClick={onClick}
      theme={themeSettings}
      data-testid="csdk-clear-selection-button"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
        <path
          fill={themeSettings.chart?.textColor}
          d="M7.187 7l9.774 10.279A1 1 0 0 0 17 17V8a1 1 0 0 0-1-1H7.187zm9.018 10.979L6.206 7.463l.487-.415A1 1 0 0 0 6 8v9a1 1 0 0 0 1 1h9c.07 0 .139-.007.205-.021zM7 6h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"
        />
      </svg>
      <ClearSelectionText theme={themeSettings}>
        {t('commonFilter.clearSelectionButton')}
      </ClearSelectionText>
    </StyledClearSelectionButton>
  );
};

/**
 * Builds the built-in "clear selection" header item for a widget.
 *
 * @param onClick - Clears the widget's common-filter selection.
 * @returns The header item, marked as a built-in so it may claim its reserved id.
 * @internal
 */
export const createClearSelectionButtonItem = (onClick: () => void): HeaderItem =>
  asBuiltInHeaderItem({
    id: WidgetHeaderTargets.ClearSelectionButton,
    component: () => <ClearSelectionButton onClick={onClick} />,
  });

import React from 'react';
import styled from '@emotion/styled';
import { SisenseSwitchButton } from '../common';
import { useThemeContext } from '@/theme-provider';
import { useTranslation } from 'react-i18next';

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const Label = styled.span`
  padding-right: 5px;
  font-family: 'Open Sans';
  color: #5b6372;
`;

type MultiSelectControlProps = {
  enabled: boolean;
  onChange?: (enabled: boolean) => void;
};

/** @internal */
export const MultiSelectControl = ({ enabled, onChange }: MultiSelectControlProps) => {
  const { t } = useTranslation();
  const { themeSettings } = useThemeContext();
  return (
    <Container>
      <Label>{t('filterEditor.labels.allowMultiSelection')}</Label>
      <SisenseSwitchButton
        checked={enabled}
        size="small"
        inputProps={{ role: 'switch', name: 'multiselect-switch' }}
        onChange={() => onChange?.(!enabled)}
        theme={themeSettings}
      />
    </Container>
  );
};

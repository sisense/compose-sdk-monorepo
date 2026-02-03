import React from 'react';
import { useTranslation } from 'react-i18next';

import { useThemeContext } from '@/infra/contexts/theme-provider';
import { Themable } from '@/infra/contexts/theme-provider/types';
import styled from '@/infra/styled';

import { SisenseSwitchButton } from '../common/index.js';

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const Label = styled.span<Themable>`
  padding-right: 5px;
  color: ${({ theme }) => theme.general.popover.content.textColor};
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
      <Label theme={themeSettings} id="multiselect-switch-label">
        {t('filterEditor.labels.allowMultiSelection')}
      </Label>
      <SisenseSwitchButton
        checked={enabled}
        size="small"
        inputProps={{
          role: 'switch',
          name: 'multiselect-switch',
          'aria-labelledby': 'multiselect-switch-label',
        }}
        onChange={() => onChange?.(!enabled)}
        theme={themeSettings}
      />
    </Container>
  );
};

import { useState } from 'react';

import styled from '@emotion/styled';

import { useThemeContext } from '@/theme-provider/theme-context';
import { Themable } from '@/theme-provider/types';

const Section = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 4px;
`;

const SectionHeader = styled.div<Themable>`
  font-size: 11px;
  line-height: 18px;
  font-weight: 300;
  color: ${({ theme }) => theme.aiChat.dropup.headers.textColor};
  cursor: pointer;
  padding: 4px 12px;
  &:hover {
    background-color: ${({ theme }) => theme.aiChat.dropup.headers.hover.backgroundColor};
  }
`;

const DropupItem = styled.div<Themable>`
  font-size: ${({ theme }) => theme.aiChat.primaryFontSize[0]};
  line-height: ${({ theme }) => theme.aiChat.primaryFontSize[1]};
  color: ${({ theme }) => theme.aiChat.dropup.items.textColor};
  cursor: pointer;
  padding: 4px 12px;
  &:hover {
    background-color: ${({ theme }) => theme.aiChat.dropup.items.hover.backgroundColor};
  }
`;

export interface DropupSectionProps {
  title: string;
  items: string[];
  onSelect: (selection: string) => void;
  alwaysExpanded?: boolean;
}

export default function DropupSection({
  title,
  items,
  onSelect,
  alwaysExpanded = false,
}: DropupSectionProps) {
  const [showItems, setShowItems] = useState(false);

  const { themeSettings } = useThemeContext();

  return (
    <Section>
      <SectionHeader onClick={() => setShowItems((v) => !v)} theme={themeSettings}>
        {title.toUpperCase()}
      </SectionHeader>
      {(showItems || alwaysExpanded) &&
        items.map((item, index) => (
          <DropupItem key={index} onClick={() => onSelect(item)} theme={themeSettings}>
            {item}
          </DropupItem>
        ))}
    </Section>
  );
}

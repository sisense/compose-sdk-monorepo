import { useMemo } from 'react';

import { DataTopicList } from './data-topics';
import SisenseLogo from './icons/sisense-logo';
import LoadingSpinner from '../common/components/loading-spinner';
import Toolbar from './common/toolbar';
import { useThemeContext } from '@/theme-provider';
import { useChatConfig } from './chat-config';
import { getDarkFactor, toColor } from '@/utils/color';
import { BetaLabel } from './common/beta-label';
import styled from '@emotion/styled';

const LogoContainer = styled.div`
  margin-left: 14px;
  margin-top: 3px;
`;

const DataTopicsContainer = styled.div<Themable>`
  display: flex;
  flex-direction: column;
  justify-content: top;
  overflow: hidden;
  height: 100%;

  background-color: ${({ theme }) => theme.aiChat.dataTopics.backgroundColor};
`;
import { Themable } from '@/theme-provider/types';
import { useTranslation } from 'react-i18next';

type ChatHomeProps = {
  dataTopicsList: string[];
  onDataTopicClick: (title: string) => void;
};

export default function ChatHome({ dataTopicsList, onDataTopicClick }: ChatHomeProps) {
  const { enableHeader } = useChatConfig();
  const { themeSettings } = useThemeContext();
  const { t } = useTranslation();

  const dataTopics = useMemo(() => {
    return dataTopicsList?.map((title) => ({
      title,
      onClick: () => onDataTopicClick(title),
    }));
  }, [dataTopicsList, onDataTopicClick]);

  const isDarkBackground =
    getDarkFactor(toColor(themeSettings.aiChat.header.backgroundColor)) > 0.5;
  return (
    <>
      {enableHeader ? (
        <Toolbar
          title={t('ai.analyticsChatbot')}
          leftNav={
            <LogoContainer>
              <SisenseLogo isDarkBackground={isDarkBackground} />
            </LogoContainer>
          }
          rightNav={<BetaLabel />}
          style={themeSettings.aiChat.header}
        />
      ) : null}
      <DataTopicsContainer theme={themeSettings}>
        {!dataTopics && <LoadingSpinner />}
        {dataTopics && <DataTopicList dataTopics={dataTopics} />}
      </DataTopicsContainer>
    </>
  );
}

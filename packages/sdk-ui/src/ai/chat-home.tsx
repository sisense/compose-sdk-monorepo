import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styled from '@emotion/styled';

import { useThemeContext } from '@/theme-provider';
import { Themable } from '@/theme-provider/types';
import { getDarkFactor, toColor } from '@/utils/color';

import LoadingSpinner from '../common/components/loading-spinner';
import { useChatConfig } from './chat-config';
import Toolbar from './common/toolbar';
import { DataTopicList } from './data-topics';
import SisenseLogo from './icons/sisense-logo';

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

import { useMemo } from 'react';

import { useGetDataTopics } from './api/hooks';
import { DataTopicList } from './data-topics';
import { DataTopic } from './data-topics/data-topic-list';
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
`;

const DataTopicsContainer = styled.div<Themable>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  height: 100%;

  background-color: ${({ theme }) => theme.aiChat.dataTopics.backgroundColor};
`;
import { Themable } from '@/theme-provider/types';

type ChatHomeProps = {
  onDataTopicClick: (title: string) => void;
};

export default function ChatHome({ onDataTopicClick }: ChatHomeProps) {
  const { data } = useGetDataTopics();
  const config = useChatConfig();
  const { themeSettings } = useThemeContext();

  const dataTopics = useMemo(
    () =>
      data?.map(
        (d): DataTopic => ({
          title: d.name,
          description: d.description,
          onClick: () => onDataTopicClick(d.name),
        }),
      ),
    [data, onDataTopicClick],
  );

  const isDarkBackground =
    getDarkFactor(toColor(themeSettings.aiChat.header.backgroundColor)) > 0.5;
  return (
    <>
      {config.enableHeader ? (
        <Toolbar
          title="Analytics Chatbot"
          leftNav={
            <LogoContainer>
              <SisenseLogo colorSchema={isDarkBackground ? 'yellow-white' : 'yellow-black'} />
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

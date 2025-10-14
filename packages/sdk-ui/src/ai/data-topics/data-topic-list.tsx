import { useTranslation } from 'react-i18next';

import styled from '@emotion/styled';

import { useThemeContext } from '@/theme-provider';
import { Themable } from '@/theme-provider/types';

import DataTopicItem from './data-topic-item';

export interface DataTopic {
  title: string;
  onClick?: () => void;
}

export interface Props {
  dataTopics: DataTopic[];
}

const FlexContainer = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: auto;
`;

const Title = styled.div<Themable>`
  font-size: 24px;
  line-height: 32px;
  font-weight: 600;
  text-align: center;
  padding-bottom: 4px;

  color: ${({ theme }) => theme.aiChat.primaryTextColor};
`;

const Subtitle = styled.div<Themable>`
  font-size: 15px;
  line-height: 22px;

  color: ${({ theme }) => theme.aiChat.primaryTextColor};
`;

export default function DataTopicList(props: Props) {
  const { dataTopics } = props;

  const { themeSettings } = useThemeContext();

  const { t } = useTranslation();

  return (
    <FlexContainer>
      <Title theme={themeSettings}>{t('ai.dataTopics')}</Title>
      <Subtitle theme={themeSettings}>
        {t('ai.chatbotDescription')}
        <br />
        <br />
        {t('ai.topicSelectPrompt')}
      </Subtitle>
      {dataTopics.map((dataTopic) => {
        return <DataTopicItem {...dataTopic} key={dataTopic.title} />;
      })}
    </FlexContainer>
  );
}

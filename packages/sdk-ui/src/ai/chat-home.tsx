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
            <div className="csdk-ml-[14px]">
              <SisenseLogo colorSchema={isDarkBackground ? 'yellow-white' : 'yellow-black'} />
            </div>
          }
          style={themeSettings.aiChat.header}
        />
      ) : null}
      <div className="csdk-flex csdk-flex-col csdk-justify-center csdk-overflow-hidden csdk-h-full ">
        {!dataTopics && <LoadingSpinner />}
        {dataTopics && <DataTopicList dataTopics={dataTopics} />}
      </div>
    </>
  );
}

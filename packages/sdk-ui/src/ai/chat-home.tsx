import { useMemo } from 'react';

import { useChatbotContext } from './chatbot-context';
import { useDataTopics } from './api/hooks';
import { DataTopicList } from './data-topics';
import { DataTopic } from './data-topics/data-topic-list';
import LoadingIcon from '../common/icons/loading-icon';
import SisenseLogo from './icons/sisense-logo';
import Toolbar from './toolbar';

export default function ChatHome() {
  const { setSelectedContext } = useChatbotContext();
  const { data } = useDataTopics();

  const dataTopics = useMemo(
    () =>
      data?.map(
        (d): DataTopic => ({
          title: d.name,
          description: d.description,
          onClick: () => setSelectedContext(d),
        }),
      ),
    [data, setSelectedContext],
  );

  return (
    <>
      <Toolbar
        title="Analytics Chatbot"
        leftNav={
          <div className="csdk-ml-[14px]">
            <SisenseLogo />
          </div>
        }
      />
      <div className="csdk-flex csdk-flex-col csdk-justify-center csdk-overflow-hidden csdk-h-full ">
        {!dataTopics && (
          <div className="csdk-self-center">
            <LoadingIcon spin />
          </div>
        )}
        {dataTopics && <DataTopicList dataTopics={dataTopics} />}
      </div>
    </>
  );
}

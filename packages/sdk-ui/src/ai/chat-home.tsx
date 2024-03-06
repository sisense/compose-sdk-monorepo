import { useMemo } from 'react';

import { useGetDataTopics } from './api/hooks';
import { DataTopicList } from './data-topics';
import { DataTopic } from './data-topics/data-topic-list';
import SisenseLogo from './icons/sisense-logo';
import LoadingSpinner from '../common/components/loading-spinner';
import Toolbar from './toolbar';

type ChatHomeProps = {
  onDataTopicClick: (title: string) => void;
};

export default function ChatHome({ onDataTopicClick }: ChatHomeProps) {
  const { data } = useGetDataTopics();

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
        {!dataTopics && <LoadingSpinner />}
        {dataTopics && <DataTopicList dataTopics={dataTopics} />}
      </div>
    </>
  );
}

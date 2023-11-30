import DataTopicItem from './data-topic-item';

export interface DataTopic {
  title: string;
  description: string;
  onClick?: () => void;
}

export interface Props {
  dataTopics: DataTopic[];
}

export default function DataTopicList(props: Props) {
  const { dataTopics } = props;
  return (
    <div className="csdk-p-[20px] csdk-flex csdk-flex-col csdk-gap-5 csdk-overflow-auto">
      <div className="csdk-text-2xl csdk-text-text-active csdk-font-semibold csdk-text-center csdk-pb-[4px]">
        Data Topics
      </div>
      <div className="csdk-text-ai-base csdk-text-text-active">
        Analytics Chatbot is designed to help you interact with your data using natural language.
        <br />
        <br />
        Pick a topic you would like to explore:
      </div>
      {dataTopics.map((dataTopic) => {
        return <DataTopicItem {...dataTopic} key={dataTopic.title} />;
      })}
    </div>
  );
}

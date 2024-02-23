import ArrowLeftIcon from '../icons/arrow-left-icon';

type Props = {
  title: string;
  description?: string;
  onClick?: () => void;
};

export default function DataTopicItem(props: Props) {
  const { title, description = '', onClick = () => {} } = props;
  return (
    <div
      onClick={onClick}
      className={
        'csdk-max-w-full csdk-shadow-ai-shadow-sm csdk-cursor-pointer csdk-rounded-[30px] csdk-h-[100px] csdk-flex csdk-items-center csdk-flex-row csdk-justify-between csdk-bg-[#F4F4F8] csdk-p-[30px]'
      }
    >
      <div>
        <div className="csdk-text-xl csdk-text-text-active">{title}</div>
        <div className="csdk-text-ai-sm csdk-text-[#8E8E8E]">{description}</div>
      </div>
      <div className="csdk-flex csdk-items-center csdk-h-[16px] csdk-w-[16px] csdk-rotate-180">
        <ArrowLeftIcon />
      </div>
    </div>
  );
}

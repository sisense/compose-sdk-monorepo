import YellowExclamationMarkIcon from '@/common/icons/yellow-exclamation-mark-icon';

type ErrorPageProps = {
  text: string;
  action?: {
    text: string;
    onClick: () => void;
  };
};

export default function ErrorContainer({ text, action }: ErrorPageProps) {
  return (
    <div className="csdk-m-auto csdk-flex csdk-flex-col csdk-items-center csdk-gap-[21px]">
      <div className="csdk-text-ai-sm csdk-text-center csdk-font-semibold">{text}</div>
      <YellowExclamationMarkIcon />
      {action && (
        <div
          className="csdk-text-ai-sm csdk-text-text-link csdk-cursor-pointer"
          onClick={action.onClick}
        >
          {action.text}
        </div>
      )}
    </div>
  );
}

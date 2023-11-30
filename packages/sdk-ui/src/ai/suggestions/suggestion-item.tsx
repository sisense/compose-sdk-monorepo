export interface SuggestedItemProps {
  question: string;
  onClick: () => void;
}

const SuggestionItem: React.FC<SuggestedItemProps> = ({ question, onClick }) => {
  const hoverStyle = 'hover:csdk-text-white hover:csdk-bg-text-content';

  return (
    <button
      className={`csdk-rounded-[20px] csdk-text-ai-sm csdk-text-text-active csdk-border csdk-border-text-content csdk-px-[14px] csdk-py-[11px] csdk-w-full csdk-bg-background-priority csdk-cursor-pointer ${hoverStyle}`}
      onClick={onClick}
    >
      {question}
    </button>
  );
};

export default SuggestionItem;

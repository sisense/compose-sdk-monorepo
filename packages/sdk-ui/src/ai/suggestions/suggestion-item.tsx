import { useChatStyle } from '../chat-style-provider';
import styled from '@emotion/styled';

const Button = styled.button<{ style?: { hoverBackgroundColor?: string } }>`
  &:hover {
    background-color: ${(props) => props.style?.hoverBackgroundColor};
  }
`;

export interface SuggestedItemProps {
  question: string;
  onClick: () => void;
}

export default function SuggestionItem({ question, onClick }: SuggestedItemProps) {
  const hoverStyle = 'hover:csdk-text-white hover:csdk-bg-text-content';

  const style = useChatStyle();

  return (
    <Button
      className={`csdk-rounded-[16px] csdk-text-ai-sm csdk-text-text-active csdk-border csdk-border-text-content csdk-px-4 csdk-py-2 csdk-bg-transparent csdk-cursor-pointer ${hoverStyle}`}
      onClick={onClick}
      style={{
        color: style.suggestions?.textColor,
        border: style.suggestions?.border,
        hoverBackgroundColor: style.suggestions?.hoverBackgroundColor,
      }}
    >
      {question}
    </Button>
  );
}

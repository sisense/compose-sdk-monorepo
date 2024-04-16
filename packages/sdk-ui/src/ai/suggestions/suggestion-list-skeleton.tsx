import styled from '@emotion/styled';
import { useChatStyle } from '../chat-style-provider';

const Row = styled.div<{ gradientColors: [string, string] }>`
  background: ${({ gradientColors: [first, second] }) => `linear-gradient(
    to right,
    ${first} 0%,
    ${second} 50%,
    ${first} 100%
  )`};
  background-size: 200% auto;
  animation: gradient 2s linear infinite;

  @keyframes gradient {
    0% {
      background-position: 0 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

const DEFAULT_GRADIENT: [string, string] = ['rgba(194, 196, 203, 1)', 'rgba(236, 236, 239, 1)'];

export default function SuggestionListSkeleton() {
  const style = useChatStyle();

  return (
    <div className="csdk-flex csdk-flex-col csdk-gap-y-4">
      {Array.from({ length: 3 }, (_, i) => (
        <Row
          key={i}
          className="csdk-w-[283px] csdk-h-[32px] csdk-rounded-[10px]"
          gradientColors={style.suggestions?.loadingGradient ?? DEFAULT_GRADIENT}
        />
      ))}
    </div>
  );
}

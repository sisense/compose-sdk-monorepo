import { useThemeContext } from '@/infra/contexts/theme-provider';
import { Themable } from '@/infra/contexts/theme-provider/types';
import styled from '@/infra/styled';

const Row = styled.div<Themable>`
  width: 283px;
  height: 32px;
  border-radius: 10px;
  background: ${({ theme }) => {
    const [firstColor, secondColor] = theme.aiChat.suggestions.loadingGradient;
    return `linear-gradient(
      to right,
      ${firstColor} 0%,
      ${secondColor} 50%,
      ${firstColor} 100%
    )`;
  }};
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

const SkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 1rem;
`;

export default function SuggestionListSkeleton() {
  const { themeSettings } = useThemeContext();
  return (
    <SkeletonContainer>
      {Array.from({ length: 3 }, (_, i) => (
        <Row key={i} theme={themeSettings} />
      ))}
    </SkeletonContainer>
  );
}

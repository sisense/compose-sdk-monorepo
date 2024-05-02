import { useThemeContext } from '@/theme-provider/theme-context';
import styled from '@emotion/styled';

const Dot = styled.div<{ color?: string }>`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: ${(props) => props.color};
  animation: hop 0.9s ease-out infinite;

  &:nth-of-type(2) {
    animation-delay: 0.1s;
  }

  &:nth-of-type(3) {
    animation-delay: 0.2s;
  }

  &:nth-of-type(4) {
    animation-delay: 0.3s;
  }

  @keyframes hop {
    0%,
    40% {
      transform: translateY(0);
    }
    20% {
      transform: translateY(-100%);
    }
  }
`;

export default function LoadingDotsIcon() {
  const { themeSettings } = useThemeContext();
  const color = themeSettings.aiChat.icons.color;

  return (
    <div
      className="csdk-flex csdk-justify-between csdk-w-[28px] csdk-py-[14.5px]"
      aria-label="loading dots"
    >
      <Dot color={color} />
      <Dot color={color} />
      <Dot color={color} />
      <Dot color={color} />
    </div>
  );
}

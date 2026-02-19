import { Themable } from '@/infra/contexts/theme-provider/types';

export default function MessageIcon({ theme }: Themable) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 14L0 10L24 0L14 24L10 20L8.47667 16.9533L19 6.4L20 4.00001L17.6099 5L7.04354 15.5218L4 14Z"
        fill={theme.aiChat.icons.color}
      />
    </svg>
  );
}

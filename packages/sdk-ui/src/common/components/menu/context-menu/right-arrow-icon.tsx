import { DEFAULT_TEXT_COLOR } from '@/const';

export default function RightArrowIcon({ color = DEFAULT_TEXT_COLOR }: { color?: string }) {
  return (
    <svg width="24px" height="24px" viewBox="0 0 24 24">
      <path
        fill={color}
        d="M13.34 12.5l-2.72-3.175a.5.5 0 1 1 .76-.65l2.998 3.5a.5.5 0 0 1 0 .65l-2.998 3.5a.5.5 0 1 1-.76-.65l2.72-3.175z"
      ></path>
    </svg>
  );
}

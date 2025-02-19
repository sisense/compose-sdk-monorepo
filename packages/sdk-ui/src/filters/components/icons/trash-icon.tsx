import type { SVGProps } from 'react';
import { DEFAULT_TEXT_COLOR } from '@/const';

export const TrashIcon = (
  props: Pick<SVGProps<SVGElement>, 'className' | 'width' | 'height' | 'fill'>,
) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M10 10.5V15.5C10 15.7761 10.2239 16 10.5 16C10.7761 16 11 15.7761 11 15.5V10.5C11 10.2239 10.7761 10 10.5 10C10.2239 10 10 10.2239 10 10.5Z"
      fill={props.fill || DEFAULT_TEXT_COLOR}
    />
    <path
      d="M13 15.5V10.5C13 10.2239 13.2239 10 13.5 10C13.7761 10 14 10.2239 14 10.5V15.5C14 15.7761 13.7761 16 13.5 16C13.2239 16 13 15.7761 13 15.5Z"
      fill={props.fill || DEFAULT_TEXT_COLOR}
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13 5H11C9.89543 5 9 5.89543 9 7H6.5C6.22386 7 6 7.22386 6 7.5C6 7.77614 6.22386 8 6.5 8H7V16.5C7 17.8807 8.11929 19 9.5 19H14.5C15.8807 19 17 17.8807 17 16.5V8H17.5C17.7761 8 18 7.77614 18 7.5C18 7.22386 17.7761 7 17.5 7H15C15 5.89543 14.1046 5 13 5ZM8 8V16.5C8 17.3284 8.67157 18 9.5 18H14.5C15.3284 18 16 17.3284 16 16.5V8H8ZM14 7H10C10 6.44772 10.4477 6 11 6H13C13.5523 6 14 6.44772 14 7Z"
      fill={props.fill || DEFAULT_TEXT_COLOR}
    />
  </svg>
);

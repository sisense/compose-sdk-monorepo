import type { SVGProps } from 'react';
import { DEFAULT_TEXT_COLOR } from '@/const';

export type DateIconProps = Pick<
  SVGProps<SVGElement>,
  'className' | 'width' | 'height' | 'style'
> & {
  iconColor?: string;
};
export const DateIcon = (props: DateIconProps) => {
  const width = props.width || '24';
  const height = props.height || '24';
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={props.className}
      style={props.style}
      width={width}
      height={height}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 5V3.5C9 3.22386 9.22386 3 9.5 3C9.77614 3 10 3.22386 10 3.5V5H13V3.5C13 3.22386 13.2239 3 13.5 3C13.7761 3 14 3.22386 14 3.5V5H17C18.1046 5 19 5.89543 19 7V8V9V17C19 18.1046 18.1046 19 17 19H6C4.89543 19 4 18.1046 4 17V9V8V7C4 5.89543 4.89543 5 6 5H9ZM10 6H13V6.5C13 6.77614 13.2239 7 13.5 7C13.7761 7 14 6.77614 14 6.5V6H17C17.5523 6 18 6.44772 18 7V8H5V7C5 6.44772 5.44772 6 6 6H9V6.5C9 6.77614 9.22386 7 9.5 7C9.77614 7 10 6.77614 10 6.5V6ZM5 17V9H18V17C18 17.5523 17.5523 18 17 18H6C5.44772 18 5 17.5523 5 17ZM14.5 12H8.5C8.22386 12 8 11.7761 8 11.5C8 11.2239 8.22386 11 8.5 11H14.5C14.7761 11 15 11.2239 15 11.5C15 11.7761 14.7761 12 14.5 12ZM8.5 14H14.5C14.7761 14 15 13.7761 15 13.5C15 13.2239 14.7761 13 14.5 13H8.5C8.22386 13 8 13.2239 8 13.5C8 13.7761 8.22386 14 8.5 14ZM14.5 16H8.5C8.22386 16 8 15.7761 8 15.5C8 15.2239 8.22386 15 8.5 15H14.5C14.7761 15 15 15.2239 15 15.5C15 15.7761 14.7761 16 14.5 16Z"
        fill={props.iconColor || DEFAULT_TEXT_COLOR}
      />
    </svg>
  );
};

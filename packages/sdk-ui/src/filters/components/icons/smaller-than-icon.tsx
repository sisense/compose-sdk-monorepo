import type { SVGProps } from 'react';

export const SmallerThanIcon = (
  props: Pick<SVGProps<SVGElement>, 'width' | 'height' | 'color'>,
) => (
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      fill={props.color ?? '#5B6372'}
      d="M16.242 15.066l-.456.89L9 12.476 15.85 9l.452.892L11.2 12.48z"
    ></path>
  </svg>
);

import type { SVGProps } from 'react';

export const SmallerThanOrEqualIcon = (
  props: Pick<SVGProps<SVGElement>, 'width' | 'height' | 'color'>,
) => (
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      fill={props.color ?? '#5B6372'}
      d="M9 17h7v1H9v-1zm6.942-2.934l-.437.89L9 11.476 15.566 8l.434.892-4.89 2.589 4.832 2.585z"
    ></path>
  </svg>
);

import type { SVGProps } from 'react';

import { DEFAULT_TEXT_COLOR } from '@/shared/const';

export const PencilIcon = (
  props: Pick<SVGProps<SVGElement>, 'className' | 'width' | 'height' | 'onClick'> & {
    color?: string;
  },
) => {
  const { color = DEFAULT_TEXT_COLOR, ...svgProps } = props;
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...svgProps}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 18.808L20 8.80798L15.0995 4L5 13.808V18.7949L10 18.808ZM6 14.2308L12.8609 7.56797L16.3433 11.0504L9.58687 17.8069L6 17.7975V14.2308ZM15.0959 5.39742L13.5783 6.87121L17.0504 10.3433L18.579 8.81475L15.0959 5.39742ZM13.499 10.4355L9.64164 14.2398L8.93945 13.5278L12.7968 9.72353L13.499 10.4355Z"
        fill={color}
      />
    </svg>
  );
};

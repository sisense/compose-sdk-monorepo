import type { SVGProps } from 'react';

export const LockIcon = (props: Pick<SVGProps<SVGElement>, 'className' | 'width' | 'height'>) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="#b4b4b4"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g transform="translate(5.000000,5.000000) scale(.70, 0.6)">
      <path d="m3,9v11h14V9M4,9V6c0-3.3 2.7-6 6-6c3.3,0 6,2.7 6,6v3H14V6c0-2.2-1.8-4-4-4-2.2,0-4,1.8-4,4v3" />
      <rect y="10" x="4" width="12" height="9" fill="#dcdcdc" />
    </g>
  </svg>
);

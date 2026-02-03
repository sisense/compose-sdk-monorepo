import type { SVGProps } from 'react';

export const MenuIcon = (props: Pick<SVGProps<SVGElement>, 'className' | 'width' | 'height'>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect x="11" y="6" width="2" height="2" fill="#5B6372" />
    <rect x="11" y="11" width="2" height="2" fill="#5B6372" />
    <rect x="11" y="16" width="2" height="2" fill="#5B6372" />
  </svg>
);

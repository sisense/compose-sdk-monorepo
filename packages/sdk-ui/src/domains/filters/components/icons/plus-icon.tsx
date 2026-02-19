import type { SVGProps } from 'react';

export const PlusIcon = (props: Pick<SVGProps<SVGElement>, 'className' | 'width' | 'height'>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12 18C12.2761 18 12.5 17.7761 12.5 17.5V13H17.5C17.7761 13 18 12.7761 18 12.5C18 12.2239 17.7761 12 17.5 12H12.5V7.5C12.5 7.22386 12.2761 7 12 7C11.7239 7 11.5 7.22386 11.5 7.5V12H6.5C6.22386 12 6 12.2239 6 12.5C6 12.7761 6.22386 13 6.5 13H11.5V17.5C11.5 17.7761 11.7239 18 12 18Z"
      fill="#5B6372"
    />
  </svg>
);

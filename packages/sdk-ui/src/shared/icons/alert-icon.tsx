import { SVGProps } from 'react';

export const AlertIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.5 21a8.5 8.5 0 1 1 0-17 8.5 8.5 0 0 1 0 17zM13 8.878c0-1.27-.499-1.896-1.496-1.878C10.501 7.03 10 7.68 10 8.95c0 .737.17 1.647.51 2.731l.318.98c.081.245.14.413.175.503.197.533.376.811.537.835.15.018.314-.248.493-.8.083-.257.161-.512.233-.763.071-.252.146-.503.224-.755.34-1.12.51-2.054.51-2.803zM11.5 18a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
      />
    </svg>
  );
};

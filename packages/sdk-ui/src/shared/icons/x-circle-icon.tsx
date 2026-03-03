import { SVGProps } from 'react';

/**
 * X circle icon - circle with X inside, used for quota error banner
 * From Figma design; uses currentColor for fill
 */
export const XCircleIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg width="24" height="24" viewBox="15 20 18 18" fill="none" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M23.5 20.5C28.1944 20.5 32 24.3056 32 29C32 33.6944 28.1944 37.5 23.5 37.5C18.8056 37.5 15 33.6944 15 29C15 24.3056 18.8056 20.5 23.5 20.5ZM26.707 25.793C26.3165 25.4024 25.6835 25.4024 25.293 25.793L23.5 27.5859L21.707 25.793C21.3165 25.4024 20.6835 25.4024 20.293 25.793C19.9024 26.1835 19.9024 26.8165 20.293 27.207L22.0859 29L20.293 30.793C19.9024 31.1835 19.9024 31.8165 20.293 32.207C20.6835 32.5976 21.3165 32.5976 21.707 32.207L23.5 30.4141L25.293 32.207C25.6835 32.5976 26.3165 32.5976 26.707 32.207C27.0976 31.8165 27.0976 31.1835 26.707 30.793L24.9141 29L26.707 27.207C27.0976 26.8165 27.0976 26.1835 26.707 25.793Z"
        fill="currentColor"
      />
    </svg>
  );
};

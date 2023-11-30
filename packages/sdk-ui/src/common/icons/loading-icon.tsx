type LoadingIconProps = {
  spin?: boolean;
};

export default function LoadingIcon({ spin }: LoadingIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={`${spin ? 'csdk-animate-spin' : ''}`}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
        fill="#262E3D"
        fillOpacity="0.3"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20 12C20 16.4183 16.4183 20 12 20C11.2844 20 10.5908 19.906 9.93078 19.7298C9.96227 19.5889 9.97888 19.4423 9.97888 19.2918C9.97888 18.1873 9.08345 17.2918 7.97888 17.2918C6.87431 17.2918 5.97888 18.1873 5.97888 19.2918C5.97888 20.3964 6.87431 21.2918 7.97888 21.2918C8.56576 21.2918 9.0936 21.0391 9.45946 20.6364C10.2652 20.8731 11.1178 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3V4C16.4183 4 20 7.58172 20 12Z"
        fill="#22C3C3"
      />
    </svg>
  );
}

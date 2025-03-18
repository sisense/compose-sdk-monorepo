export const ArrowIcon = (props: { direction: 'left' | 'right' | 'up' | 'down' }) => {
  const rotationDegree = RotationDegreeMap[props.direction];
  return (
    <svg
      width="8"
      height="4"
      viewBox="0 0 8 4"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      transform={`rotate(${rotationDegree})`}
    >
      <path
        d="M3.99928 2.84103L7.17398 0.121274C7.38369 -0.0583834 7.69933 -0.0340215 7.87899 0.175688C8.05865 0.385397 8.03428 0.701041 7.82457 0.880698L4.32457 3.87914C4.13736 4.03952 3.86119 4.03952 3.67398 3.87914L0.173979 0.880698C-0.0357305 0.701041 -0.0600924 0.385397 0.119565 0.175688C0.299222 -0.0340215 0.614866 -0.0583834 0.824575 0.121274L3.99928 2.84103Z"
        fill="#5B6372"
      />
    </svg>
  );
};

const RotationDegreeMap = {
  left: 90,
  right: 270,
  up: 180,
  down: 0,
};

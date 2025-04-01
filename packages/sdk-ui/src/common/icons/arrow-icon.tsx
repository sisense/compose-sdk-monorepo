export const ArrowIcon = (props: { direction: 'left' | 'right' | 'up' | 'down' }) => {
  const rotationDegree = RotationDegreeMap[props.direction];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      transform={`rotate(${rotationDegree})`}
    >
      <path
        d="M11.9992 13.841L15.1739 11.1213C15.3836 10.9416 15.6993 10.966 15.8789 11.1757C16.0586 11.3854 16.0342 11.701 15.8245 11.8807L12.3245 14.8791C12.1373 15.0395 11.8611 15.0395 11.6739 14.8791L8.17392 11.8807C7.96421 11.701 7.93985 11.3854 8.1195 11.1757C8.29916 10.966 8.6148 10.9416 8.82451 11.1213L11.9992 13.841Z"
        fill="#262E3D"
        fillOpacity="0.67"
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

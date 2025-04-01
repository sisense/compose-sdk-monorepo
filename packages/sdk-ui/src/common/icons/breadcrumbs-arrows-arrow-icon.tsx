export const BreadcrumbsArrowsIcon = ({
  direction = 'right',
}: {
  direction?: 'left' | 'right';
}) => {
  const rotationDegree = RotationDegreeMap[direction];
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.1203 8.82531L11.8401 12L9.1203 15.1747C8.94064 15.3844 8.965 15.7001 9.17471 15.8797C9.38442 16.0594 9.70006 16.035 9.87972 15.8253L12.8782 12.3253C13.0385 12.1381 13.0385 11.8619 12.8782 11.6747L9.87972 8.17471C9.70006 7.965 9.38442 7.94064 9.17471 8.1203C8.965 8.29995 8.94064 8.6156 9.1203 8.82531ZM12.1731 8.1203C11.9634 8.29995 11.9391 8.6156 12.1187 8.82531L14.8385 12L12.1187 15.1747C11.9391 15.3844 11.9634 15.7001 12.1731 15.8797C12.3829 16.0594 12.6985 16.035 12.8782 15.8253L15.8766 12.3253C16.037 12.1381 16.037 11.8619 15.8766 11.6747L12.8782 8.17471C12.6985 7.965 12.3829 7.94064 12.1731 8.1203Z"
        fill="#262E3D"
        fillOpacity="0.67"
      />
    </svg>
  );
};

const RotationDegreeMap = {
  left: 180,
  right: 0,
};

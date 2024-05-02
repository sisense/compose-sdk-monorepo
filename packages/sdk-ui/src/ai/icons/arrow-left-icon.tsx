type Colorable = {
  color: string;
};

export default function ArrowLeftIcon({ color }: Colorable) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 4 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.87815 0.825307C4.05781 0.615598 4.03345 0.299954 3.82374 0.120297C3.61403 -0.05936 3.29838 -0.034998 3.11873 0.174711L0.120288 3.67471C-0.040096 3.86192 -0.040096 4.1381 0.120288 4.32531L3.11873 7.82531C3.29838 8.03502 3.61403 8.05938 3.82374 7.87972C4.03345 7.70006 4.05781 7.38442 3.87815 7.17471L1.15839 4.00001L3.87815 0.825307Z"
        fill={color}
      />
    </svg>
  );
}

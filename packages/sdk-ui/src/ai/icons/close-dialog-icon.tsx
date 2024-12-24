export default function CloseDialogIcon({ fillColor = '#262E3D' }: { fillColor?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
      <rect x="1" y="1" width="28" height="28" rx="14" stroke="#9EA2AB" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.2929 15L9.14645 9.85355C8.95118 9.65829 8.95118 9.34171 9.14645 9.14645C9.34171 8.95118 9.65829 8.95118 9.85355 9.14645L15 14.2929L20.1464 9.14645C20.3417 8.95118 20.6583 8.95118 20.8536 9.14645C21.0488 9.34171 21.0488 9.65829 20.8536 9.85355L15.7071 15L20.8536 20.1464C21.0488 20.3417 21.0488 20.6583 20.8536 20.8536C20.6583 21.0488 20.3417 21.0488 20.1464 20.8536L15 15.7071L9.85355 20.8536C9.65829 21.0488 9.34171 21.0488 9.14645 20.8536C8.95118 20.6583 8.95118 20.3417 9.14645 20.1464L14.2929 15Z"
        fill={fillColor}
      />
    </svg>
  );
}

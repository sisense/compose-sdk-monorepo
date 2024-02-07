export const LoadingDots = ({ color }: { color: string | undefined }) => {
  const dotStyle = {
    backgroundColor: color || '#333333',
    float: 'left' as const,
    width: '10px',
    height: '10px',
    marginRight: '7px',
    WebkitAnimation: 'loading-dots-animation 1.8s infinite ease-in-out',
    animation: 'loading-dots-animation 1.8s infinite ease-in-out',
    borderRadius: '50%',
    opacity: 0.75,
  };

  const firstDotStyle = {
    ...dotStyle,
    WebkitAnimationDelay: '-0.32s',
    animationDelay: '-0.32s',
  };

  const secondDotStyle = {
    ...dotStyle,
    WebkitAnimationDelay: '-0.16s',
    animationDelay: '-0.16s',
  };

  const thirdDotStyle = {
    ...dotStyle,
    marginRight: 'unset',
  };

  const keyframes = {
    '0%, 80%, 100%': {
      WebkitTransform: 'scale(0) rotate(0deg)',
      transform: 'scale(0) rotate(0deg)',
    },
    '40%': {
      WebkitTransform: 'scale(1) rotate(0.02deg)',
      transform: 'scale(1) rotate(0.02deg)',
    },
  };

  return (
    <div>
      <style>
        {`
          @keyframes loading-dots-animation {
              ${Object.entries(keyframes)
                .map(
                  ([key, value]) =>
                    `${key} { ${Object.entries(value)
                      .map(([k, v]) => `${k}: ${v};`)
                      .join('')} }`,
                )
                .join('')}
            }
            `}
      </style>
      <div style={firstDotStyle} />
      <div style={secondDotStyle} />
      <div style={thirdDotStyle} />
    </div>
  );
};

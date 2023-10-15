import { useState } from 'react';
import styles from './error-boundary-box.module.scss';
import { translation } from '../locales/en';

/**
 * This component is used to display an error message when a component fails to render.
 * It is used by the ErrorBoundary component.
 *
 * @param props - component properties
 * @param props.errorText - The error message to display
 * @returns A component which will replace the component when it fails to render
 */
const ErrorBoundaryBox = ({ errorText = translation.errors.componentRenderError }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const icon = (
    <div className={styles.icon} title="">
      <svg width="53px" height="53px" viewBox="0 0 53 53">
        <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
          <g>
            <polygon points="26.4996 -0.000100000005 -0.000400000001 26.5009 26.4996 52.9999 53.0006 26.5009"></polygon>
            <path
              d="M24.5,39.054 L24.5,35.054 L28.5,35.054 L28.5,39.054 L24.5,39.054 Z M28.5,31.0536 L24.5,31.0536 L23.5,13.0536 L29.5,13.0536 L28.5,31.0536 Z"
              fill="#FFFFFF"
            ></path>
          </g>
        </g>
      </svg>
    </div>
  );

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={styles.container}
    >
      <div className={styles.card}>
        {icon}
        {isHovered && <div className={styles.text}>{errorText}</div>}
      </div>
    </div>
  );
};

export default ErrorBoundaryBox;

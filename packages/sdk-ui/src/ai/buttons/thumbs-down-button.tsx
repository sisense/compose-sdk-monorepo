import { useState } from 'react';

import ThumbsDownHoveredIcon from '@/ai/icons/thumbs-down-hovered-icon';
import ThumbsDownIcon from '@/ai/icons/thumbs-down-icon';
import Tooltip from '@/ai/common/tooltip';
import { useThemeContext } from '@/theme-provider/theme-context';

type ThumbsDownButtonProps = {
  onClick?: () => void;
};

export default function ThumbsDownButton({ onClick }: ThumbsDownButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { themeSettings } = useThemeContext();

  return (
    <Tooltip title="Incorrect response">
      <span
        aria-label="thumbs-down"
        className="csdk-w-[34px] csdk-h-[35px] csdk-cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
      >
        {!isHovered && <ThumbsDownIcon theme={themeSettings} />}
        {isHovered && <ThumbsDownHoveredIcon theme={themeSettings} />}
      </span>
    </Tooltip>
  );
}

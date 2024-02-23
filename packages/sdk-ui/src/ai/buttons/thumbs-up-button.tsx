import { useState } from 'react';

import ThumbsUpHoveredIcon from '@/ai/icons/thumbs-up-hovered-icon';
import ThumbsUpIcon from '@/ai/icons/thumbs-up-icon';
import Tooltip from '@/ai/common/tooltip';

type ThumbsUpButtonProps = {
  onClick?: () => void;
};

export default function ThumbsUpButton({ onClick }: ThumbsUpButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Tooltip title="Correct response">
      <span
        aria-label="thumbs-up"
        className="csdk-w-[34px] csdk-h-[35px] csdk-cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
      >
        {!isHovered && <ThumbsUpIcon />}
        {isHovered && <ThumbsUpHoveredIcon />}
      </span>
    </Tooltip>
  );
}

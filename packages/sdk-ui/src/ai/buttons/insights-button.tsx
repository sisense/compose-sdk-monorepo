import { useState } from 'react';
import LightBulbIcon from '../icons/light-bulb-icon';
import ClickableMessage from '../messages/clickable-message';

export default function InsightsButton({ onClick }: { onClick?: () => void }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <ClickableMessage
      align="left"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`csdk-py-[5px] csdk-px-2 csdk-flex csdk-items-center csdk-gap-x-2 csdk-select-none`}
      >
        <LightBulbIcon hover={isHovered} />
        Insights
      </div>
    </ClickableMessage>
  );
}

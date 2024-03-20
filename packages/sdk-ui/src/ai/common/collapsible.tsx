import { useLayoutEffect, useRef, useState } from 'react';

type CollapsibleProps = {
  text: string;
};

// line height * number of rows
const MAX_HEIGHT_PX = 18 * 5;

/**
 * Text container with an expand/collapse button for text over the character limit.
 *
 * @internal
 */
export default function Collapsible({ text }: CollapsibleProps) {
  const [collapsed, setCollapsed] = useState(true);
  const [showReadMore, setShowReadMore] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (ref.current && ref.current.scrollHeight > MAX_HEIGHT_PX) {
      setShowReadMore(true);
    }
  }, [text]);

  return (
    <div>
      <div ref={ref} className={`${collapsed ? 'csdk-line-clamp-5' : ''} csdk-whitespace-pre-wrap`}>
        {text}
      </div>
      {showReadMore && (
        <div className="csdk-mt-3 csdk-flex csdk-justify-end">
          <div
            className="csdk-text-ai-xs csdk-text-text-link csdk-cursor-pointer"
            onClick={() => setCollapsed((v) => !v)}
          >
            {collapsed ? 'Read more' : 'Collapse'}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';

type CollapsibleProps = {
  text: string;
};

const CHAR_LIMIT = 200;

/**
 * Text container with an expand/collapse button for text over the character limit.
 *
 * @internal
 */
export default function Collapsible({ text }: CollapsibleProps) {
  const [collapsed, setCollapsed] = useState(true);

  const showCollapse = text.length > CHAR_LIMIT;

  return (
    <div>
      <div className={`${collapsed ? 'csdk-line-clamp-5' : ''} csdk-whitespace-pre-wrap`}>
        {text}
      </div>
      <div className="csdk-mt-3 csdk-flex csdk-justify-end">
        {showCollapse && (
          <div
            className="csdk-text-ai-xs csdk-text-text-link csdk-cursor-pointer"
            onClick={() => setCollapsed((v) => !v)}
          >
            {collapsed ? 'Read more' : 'Collapse'}
          </div>
        )}
      </div>
    </div>
  );
}

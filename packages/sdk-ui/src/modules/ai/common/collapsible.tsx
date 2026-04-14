import { useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type CollapsibleProps = {
  text: string;
};

/** Matches `ai-xs` line height in theme. */
const LINE_HEIGHT_PX = 18;
const COLLAPSED_LINE_COUNT = 5;
const MAX_HEIGHT_PX = LINE_HEIGHT_PX * COLLAPSED_LINE_COUNT;

/**
 * Text container with an expand/collapse button for text over the character limit.
 *
 * Uses `max-height` + `overflow: hidden` when collapsed (not `line-clamp`), because
 * `white-space: pre-wrap` is incompatible with `-webkit-line-clamp` in browsers.
 *
 * @internal
 */
export default function Collapsible({ text }: CollapsibleProps) {
  const [collapsed, setCollapsed] = useState(true);
  const [showReadMore, setShowReadMore] = useState(false);

  const { t } = useTranslation();

  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (ref.current) {
      setShowReadMore(ref.current.scrollHeight > MAX_HEIGHT_PX);
    }
  }, [text]);

  return (
    <div className="csdk-min-w-0 csdk-flex-1">
      <div
        ref={ref}
        className={`csdk-whitespace-pre-wrap ${collapsed ? 'csdk-overflow-hidden' : ''}`}
        style={collapsed ? { maxHeight: MAX_HEIGHT_PX } : undefined}
      >
        {text}
      </div>
      {showReadMore && (
        <div className="csdk-mt-3 csdk-flex csdk-justify-end">
          <div
            className="csdk-text-ai-xs csdk-text-text-link csdk-cursor-pointer"
            onClick={() => setCollapsed((v) => !v)}
          >
            {collapsed ? t('ai.buttons.readMore') : t('ai.buttons.collapse')}
          </div>
        </div>
      )}
    </div>
  );
}

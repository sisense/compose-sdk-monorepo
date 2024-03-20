import { debounce } from 'lodash';
import { ReactNode, useCallback, useState } from 'react';

import { useChatApi } from '@/ai/api/chat-api-provider';
import ThumbsDownButton from '@/ai/buttons/thumbs-down-button';
import ThumbsUpButton from '@/ai/buttons/thumbs-up-button';
import { useHover } from '@/common/hooks/use-hover';
import ThumbsUpIcon from '../icons/thumbs-up-icon';
import ThumbsDownIcon from '../icons/thumbs-down-icon';

function FeedbackRow({ visible, onSend }: { visible: boolean; onSend: (rating: -1 | 1) => void }) {
  const [clicked, setClicked] = useState(false);

  const onClick = useCallback(
    (type: 'up' | 'down') => {
      setClicked(true);

      onSend(type === 'up' ? 1 : -1);
    },
    [onSend],
  );

  const styles = `csdk-transition-opacity csdk-delay-150 csdk-duration-500 ${
    clicked ? 'csdk-opacity-0' : 'csdk-opacity-100'
  }`;

  if (!visible) {
    return null;
  }

  return (
    <div className={`csdk-flex ${styles}`}>
      {clicked && (
        <>
          <ThumbsUpIcon />
          <ThumbsDownIcon />
        </>
      )}
      {!clicked && (
        <>
          <ThumbsUpButton onClick={() => onClick('up')} />
          <ThumbsDownButton onClick={() => onClick('down')} />
        </>
      )}
    </div>
  );
}

type FeedbackWrapperProps = {
  sourceId: string;
  data: object;
  type: string;
  rightFooter?: ReactNode;
  children: ReactNode;
};

export default function FeedbackWrapper({
  sourceId,
  data,
  type,
  rightFooter,
  children,
}: FeedbackWrapperProps) {
  const api = useChatApi();
  const sendFeedback = debounce(
    useCallback(
      (rating: -1 | 1) => {
        if (!api) {
          return;
        }

        api.ai.sendFeedback({
          sourceId,
          type,
          data,
          rating,
        });
      },
      [api, sourceId, data, type],
    ),
    200,
  );

  const [ref, hovering] = useHover<HTMLDivElement>();

  return (
    <div ref={ref}>
      {children}
      <div className="csdk-flex csdk-items-center csdk-mt-4 csdk-h-[35px]">
        <FeedbackRow onSend={sendFeedback} visible={hovering} />
        {rightFooter}
      </div>
    </div>
  );
}

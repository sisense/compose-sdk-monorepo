import * as React from 'react';

type Props = {
  content?: string;
  attrs: Record<any, any>;
  events: Record<string, Function>;
  callbackProps: Record<any, any>;
};

export const ControlButton = (props: Props) => {
  const { content, attrs, callbackProps, events } = props;
  const buttonEvents: Record<string, Function> = {};
  Object.keys(events).forEach((eventName: string) => {
    buttonEvents[eventName] = () => {
      events[eventName](callbackProps);
    };
  });
  return (
    <div {...buttonEvents} {...attrs}>
      {content}
    </div>
  );
};

export default ControlButton;

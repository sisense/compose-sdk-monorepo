import styled from '@emotion/styled';
import { FunctionComponent } from 'react';
import DOMPurify from 'dompurify';
import { asSisenseComponent } from '@/decorators/component-decorators/as-sisense-component';
import { TextWidgetStyleOptions } from '@/types';
import { TextWidgetProps } from '@/props';

export function isTextWidgetProps(props: any): props is TextWidgetProps {
  return (
    props !== null &&
    typeof props === 'object' &&
    typeof props.styleOptions === 'object' &&
    typeof props.styleOptions.html === 'string' &&
    typeof props.styleOptions.bgColor === 'string' &&
    typeof props.styleOptions.vAlign === 'string'
  );
}

type Stylable = {
  styleOptions: TextWidgetStyleOptions;
};

const VERTICAL_ALIGNMENT_DICTIONARY = {
  'valign-top': 'flex-start',
  'valign-middle': 'center',
  'valign-bottom': 'flex-end',
} as const;

const TextWidgetContainer = styled.div<Stylable>`
  background-color: ${(props) => props.styleOptions.bgColor};
  display: flex;
  align-items: ${(props) => VERTICAL_ALIGNMENT_DICTIONARY[props.styleOptions.vAlign]};
  text-align: center;
  height: 100%;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
`;

const InnerHtml = styled.div`
  width: 100%;
`;

/**
 * A widget that displays HTML content.
 *
 * @internal
 */
export const TextWidget: FunctionComponent<TextWidgetProps> = asSisenseComponent({
  componentName: 'TextWidget',
})((props) => {
  const sanitizedHtml = DOMPurify.sanitize(props.styleOptions.html);
  return (
    <TextWidgetContainer styleOptions={props.styleOptions}>
      <InnerHtml dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
    </TextWidgetContainer>
  );
});

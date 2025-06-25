import styled from '@emotion/styled';
import { FunctionComponent, type MouseEvent } from 'react';
import DOMPurify from 'dompurify';
import { asSisenseComponent } from '@/decorators/component-decorators/as-sisense-component';
import { TextWidgetStyleOptions, CompleteThemeSettings, TextWidgetDataPoint } from '@/types';
import { TextWidgetProps } from '@/props';
import { WidgetSpaceAround } from './common/widget-style-utils';
import { useThemeContext } from '../theme-provider';
import get from 'lodash-es/get';
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

type Themeable = {
  styleOptions: TextWidgetStyleOptions;
  themeSettings: CompleteThemeSettings;
};

type Stylable = {
  styleOptions: TextWidgetStyleOptions;
  cursor?: string;
};

const VERTICAL_ALIGNMENT_DICTIONARY = {
  'valign-top': 'flex-start',
  'valign-middle': 'center',
  'valign-bottom': 'flex-end',
} as const;

const TextWidgetSpaceAroundWrapper = styled.div<Themeable>`
  padding: ${(props) =>
    WidgetSpaceAround[
      get(props.styleOptions, 'spaceAround', props.themeSettings.widget.spaceAround)
    ] || '0px'};
`;

const TextWidgetContainer = styled.div<Stylable>`
  background-color: ${(props) => props.styleOptions.bgColor};
  display: flex;
  align-items: ${(props) => VERTICAL_ALIGNMENT_DICTIONARY[props.styleOptions.vAlign]};
  text-align: center;
  height: 100%;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  cursor: ${(props) => props.cursor || 'default'};
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
  const { html } = props.styleOptions;
  const sanitizedHtml = DOMPurify.sanitize(html);
  const { themeSettings } = useThemeContext();

  const handleContainerClick = (event: MouseEvent<HTMLDivElement>) => {
    if (props.onDataPointClick) {
      const point: TextWidgetDataPoint = {
        html,
      };
      props.onDataPointClick(point, event.nativeEvent);
    }
  };

  return (
    <TextWidgetSpaceAroundWrapper themeSettings={themeSettings} styleOptions={props.styleOptions}>
      <TextWidgetContainer
        styleOptions={props.styleOptions}
        onClick={handleContainerClick}
        cursor={props.onDataPointClick ? 'pointer' : 'default'}
      >
        <InnerHtml dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
      </TextWidgetContainer>
    </TextWidgetSpaceAroundWrapper>
  );
});

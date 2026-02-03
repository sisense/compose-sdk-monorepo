import { FunctionComponent, type MouseEvent } from 'react';

import DOMPurify from 'dompurify';
import get from 'lodash-es/get';

import { useThemeContext } from '@/infra/contexts/theme-provider';
import { asSisenseComponent } from '@/infra/decorators/component-decorators/as-sisense-component';
import styled from '@/infra/styled';
import { TextWidgetProps } from '@/props';
import { CompleteThemeSettings, TextWidgetDataPoint, TextWidgetStyleOptions } from '@/types';

import { WidgetSpaceAround } from '../shared/widget-style-utils';

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
  width: 100%;
  height: 100%;
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
  position: relative;

  &:hover .text-widget-header {
    visibility: visible;
  }
`;

const TextWidgetHeader = styled.div`
  position: absolute;
  width: 100%;
  box-sizing: border-box;
  top: 0;
  left: 0;
  padding: 5px 10px;
  display: flex;
  justify-content: space-between;
  visibility: hidden;
`;

const TextWidgetHeaderTitle = styled.div`
  flex-grow: 1;
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
  const { html, header } = props.styleOptions;
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

  const isHeaderHidden = header?.hidden ?? false;

  return (
    <TextWidgetSpaceAroundWrapper themeSettings={themeSettings} styleOptions={props.styleOptions}>
      <TextWidgetContainer
        styleOptions={props.styleOptions}
        onClick={handleContainerClick}
        cursor={props.onDataPointClick ? 'pointer' : 'default'}
      >
        {!isHeaderHidden && (
          <TextWidgetHeader className={'text-widget-header'}>
            <TextWidgetHeaderTitle>{header?.renderTitle?.(null)}</TextWidgetHeaderTitle>
            <div>{header?.renderToolbar?.(null)}</div>
          </TextWidgetHeader>
        )}
        <InnerHtml dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
      </TextWidgetContainer>
    </TextWidgetSpaceAroundWrapper>
  );
});

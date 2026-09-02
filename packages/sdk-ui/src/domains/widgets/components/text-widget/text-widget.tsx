import { FunctionComponent, type MouseEvent, useMemo } from 'react';

import styled from '@emotion/styled';
import DOMPurify from 'dompurify';
import get from 'lodash-es/get';

import { HeaderItemsRenderer } from '@/domains/shared/header';
import { useThemeContext } from '@/infra/contexts/theme-provider';
import { asSisenseComponent } from '@/infra/decorators/component-decorators/as-sisense-component';
import {
  CompleteThemeSettingsInternal,
  TextWidgetDataPoint,
  TextWidgetStyleOptions,
} from '@/types';

import { useTrackWidgetInit } from '../../hooks/use-track-widget-init';
import { getWidgetEntityId } from '../../hooks/widget-entity-id';
import { getTextWidgetName, getWidgetTitle } from '../../hooks/widget-tracking-adapters';
import {
  WIDGET_HEADER_ITEM_SIZE,
  WIDGET_HEADER_ITEMS_GAP,
} from '../../shared/widget-header/constants';
import { useWidgetHeaderMenu } from '../../shared/widget-header/features/use-widget-header-menu';
import { useResolvedWidgetHeaderItems } from '../../shared/widget-header/use-resolved-widget-header-items';
import { WidgetSpaceAround } from '../../shared/widget-style-utils';
import { TextWidgetProps } from './types';

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
  themeSettings: CompleteThemeSettingsInternal;
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

/**
 * The text widget has no title bar of its own: the header floats over the top of the body, revealed
 * on hover. Because it overlays the content, the strip itself must stay transparent to the pointer —
 * its full-width spacer would otherwise sit between the cursor and the text and swallow every click
 * on the widget body (which is itself a click target, e.g. as a jump-to-dashboard source). Header
 * item cells that actually drew something take pointer events back (see `HeaderItemCell`), so the
 * menu and any custom items stay clickable.
 */
const TextWidgetHeader = styled.div`
  position: absolute;
  width: 100%;
  box-sizing: border-box;
  top: 0;
  left: 0;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  visibility: hidden;
  pointer-events: none;
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
  useTrackWidgetInit({
    widgetType: 'text',
    widgetName: getTextWidgetName(),
    widgetTitle: getWidgetTitle(props),
    entityId: getWidgetEntityId(props, 'text', getTextWidgetName()),
  });
  const { html, header } = props.styleOptions;
  const sanitizedHtml = DOMPurify.sanitize(html);
  const { themeSettings } = useThemeContext();

  // A text widget has no title and no query result: the only header feature it uses is the menu.
  const fullHeaderConfig = useWidgetHeaderMenu(props.config?.header);
  const resolvedHeaderItems = useResolvedWidgetHeaderItems({ config: fullHeaderConfig });

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
          <TextWidgetHeader className={'text-widget-header'} data-component="header-container">
            <HeaderItemsRenderer
              items={resolvedHeaderItems}
              defaultSize={WIDGET_HEADER_ITEM_SIZE}
              gap={WIDGET_HEADER_ITEMS_GAP}
            />
          </TextWidgetHeader>
        )}
        <InnerHtml dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
      </TextWidgetContainer>
    </TextWidgetSpaceAroundWrapper>
  );
});

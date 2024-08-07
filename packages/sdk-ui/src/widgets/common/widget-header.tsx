import Divider from '@mui/material/Divider';
import { useThemeContext } from '../../theme-provider';
import { AlignmentTypes, WidgetContainerStyleOptions } from '../../types';
import WidgetHeaderInfoButton from './widget-header-info-button';
import get from 'lodash/get';

interface WidgetHeaderProps {
  onRefresh: () => void;
  title?: string;
  description?: string;
  dataSetName?: string;
  styleOptions?: WidgetContainerStyleOptions['header'];
}

export const WidgetHeader: React.FC<WidgetHeaderProps> = ({
  title,
  description,
  dataSetName,
  styleOptions,
  onRefresh,
}: WidgetHeaderProps) => {
  const { themeSettings } = useThemeContext();

  const renderToolbar = () => {
    const toolbar = (
      <>
        <WidgetHeaderInfoButton
          title={dataSetName}
          description={description}
          styleOptions={styleOptions}
          onRefresh={onRefresh}
        />
      </>
    );

    if (styleOptions?.renderToolbar) {
      return styleOptions?.renderToolbar?.(onRefresh, toolbar);
    }

    return toolbar;
  };

  return (
    <>
      <div
        className={'csdk-flex csdk-flex-row csdk-items-center csdk-px-2 csdk-min-h-[32px]'}
        style={{
          backgroundColor:
            styleOptions?.backgroundColor || themeSettings.widget.header.backgroundColor,
        }}
      >
        <div
          className={'csdk-w-full csdk-whitespace-nowrap csdk-overflow-hidden'}
          style={{
            textAlign: getTextAlignment(
              styleOptions?.titleAlignment || themeSettings.widget.header.titleAlignment,
            ),
            color: styleOptions?.titleTextColor || themeSettings.widget.header.titleTextColor,
            fontFamily: themeSettings.typography?.fontFamily,
            fontSize: 15,
          }}
        >
          {title || ''}
        </div>
        <div className={'csdk-ml-auto csdk-flex csdk-items-center'}>{renderToolbar()}</div>
      </div>
      {get(styleOptions, 'dividerLine', themeSettings.widget.header.dividerLine) && (
        <Divider
          style={{
            backgroundColor:
              styleOptions?.dividerLineColor ||
              themeSettings.widget.header.dividerLineColor ||
              '#d5d5d5',
          }}
        />
      )}
    </>
  );
};

function getTextAlignment(type: AlignmentTypes) {
  return type.toLowerCase() as 'left' | 'center' | 'right';
}

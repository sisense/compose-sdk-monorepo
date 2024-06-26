import Divider from '@mui/material/Divider';
import classNames from 'classnames';
import { useThemeContext } from '../../theme-provider';
import { WidgetStyleOptions } from '../../types';
import WidgetHeaderInfoButton from './widget-header-info-button';

interface WidgetHeaderProps {
  onRefresh: () => void;
  title?: string;
  description?: string;
  dataSetName?: string;
  styleOptions?: WidgetStyleOptions['header'];
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
          backgroundColor: styleOptions?.backgroundColor || themeSettings.chart?.backgroundColor,
        }}
      >
        <div
          className={classNames(
            styleOptions?.titleAlignment === 'Center' ? 'csdk-text-center' : 'csdk-text-left',
            'csdk-w-full csdk-whitespace-nowrap csdk-overflow-hidden',
          )}
          style={{
            color: styleOptions?.titleTextColor || themeSettings.chart?.textColor,
            fontFamily: themeSettings.typography?.fontFamily,
            fontSize: 15,
          }}
        >
          {title || ''}
        </div>
        <div className={'csdk-ml-auto csdk-flex csdk-items-center'}>{renderToolbar()}</div>
      </div>
      {styleOptions?.dividerLine && (
        <Divider
          style={{
            backgroundColor: styleOptions?.dividerLineColor || '#d5d5d5',
          }}
        />
      )}
    </>
  );
};

import { useTranslation } from 'react-i18next';

import styled from '@emotion/styled';
import { BaseMeasure, DataSource } from '@sisense/sdk-data';

import { AddMeasureDataBrowser } from '@/domains/data-browser/add-measure-popover/add-measure-data-browser';
import { useThemeContext } from '@/infra/contexts/theme-provider/theme-context';
import { Themable } from '@/infra/contexts/theme-provider/types';
import { withErrorBoundary } from '@/infra/decorators/component-decorators/with-error-boundary';
import { TranslatableError } from '@/infra/translation/translatable-error';
import { Popover } from '@/shared/components/popover';

import { PopoverHeader } from '../add-filter-popover/popover-header';

type AddMeasurePopoverProps = {
  anchorEl: HTMLElement;
  isOpen: boolean;
  onClose?: () => void;
  dataSources: DataSource[];
  initialDataSource: DataSource;
  onMeasureCreated: (measure: BaseMeasure) => void;
};

const PopoverContent = withErrorBoundary({
  componentName: 'AddMeasurePopoverContent',
})(styled.div<Themable>`
  width: 626px;
  height: 530px;
  display: flex;
  flex-direction: column;
`);

/**
 * A popover with "data browser" that allows users to select a data source and an attribute to create a measure.
 */
export const AddMeasurePopover = ({
  anchorEl,
  isOpen,
  onClose,
  dataSources,
  initialDataSource,
  onMeasureCreated,
}: AddMeasurePopoverProps) => {
  const { t } = useTranslation();

  const { themeSettings } = useThemeContext();
  return (
    <Popover
      position={{
        anchorEl,
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'left',
        },
        contentOrigin: {
          vertical: 'top',
          horizontal: 'right',
        },
      }}
      open={isOpen}
      onClose={onClose}
    >
      <PopoverContent theme={themeSettings} data-testid="add-measure-popover">
        <PopoverHeader
          title={t('dataBrowser.addMeasure')}
          flowPath={[{ title: t('dataBrowser.selectField'), isCurrentStep: true }]}
          onClose={onClose}
        />
        {dataSources.length > 0 ? (
          <AddMeasureDataBrowser
            dataSources={dataSources}
            initialDataSource={initialDataSource}
            onMeasureCreated={onMeasureCreated}
          />
        ) : (
          <ThrownError />
        )}
      </PopoverContent>
    </Popover>
  );
};

const ThrownError = () => {
  throw new TranslatableError('errors.addFilterPopover.noDataSources');
};

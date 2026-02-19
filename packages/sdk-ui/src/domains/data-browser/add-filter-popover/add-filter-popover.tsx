import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { DataSource, DateDimension, Filter, filterFactory, MetadataTypes } from '@sisense/sdk-data';

import { useThemeContext } from '@/infra/contexts/theme-provider/theme-context';
import { Themable } from '@/infra/contexts/theme-provider/types';
import { withErrorBoundary } from '@/infra/decorators/component-decorators/with-error-boundary';
import styled from '@/infra/styled';
import { TranslatableError } from '@/infra/translation/translatable-error';
import { Popover } from '@/shared/components/popover';

import { AttributiveElement } from '../dimensions-browser/types';
import { AddFilterDataBrowser } from './add-filter-data-browser';
import { PopoverHeader } from './popover-header';

type AddFilterPopoverProps = {
  anchorEl: HTMLElement;
  isOpen: boolean;
  onClose?: () => void;
  dataSources: DataSource[];
  initialDataSource: DataSource;
  /**
   * Optional. If provided, these attributes in the data browser will be disabled and can't be selected for filter creation.
   */
  disabledAttributes?: AttributiveElement[];
  onFilterCreated: (filter: Filter) => void;
};

const PopoverContent = withErrorBoundary({
  componentName: 'AddFilterPopoverContent',
})(styled.div<Themable>`
  width: 626px;
  height: 530px;
  display: flex;
  flex-direction: column;
`);

/**
 * A popover with "data browser" that allows users to select a data source and an attribute to create a filter.
 */
export const AddFilterPopover = ({
  anchorEl,
  isOpen,
  onClose,
  dataSources,
  initialDataSource,
  onFilterCreated,
  disabledAttributes,
}: AddFilterPopoverProps) => {
  const { t } = useTranslation();

  const handleAttributeClick = useCallback(
    (attribute: AttributiveElement) => {
      const filter = createFilter(attribute);
      onFilterCreated(filter);
    },
    [onFilterCreated],
  );

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
      <PopoverContent theme={themeSettings} data-testid="add-filter-popover">
        <PopoverHeader
          title={t('dataBrowser.addFilter')}
          flowPath={[
            { title: t('dataBrowser.selectField'), isCurrentStep: true },
            { title: t('dataBrowser.configureFilter'), isCurrentStep: false },
          ]}
          onClose={onClose}
        />
        {dataSources.length > 0 ? (
          <AddFilterDataBrowser
            dataSources={dataSources}
            initialDataSource={initialDataSource}
            onAttributeClick={handleAttributeClick}
            disabledAttributes={disabledAttributes}
          />
        ) : (
          <ThrownError />
        )}
      </PopoverContent>
    </Popover>
  );
};

function isDateDimension(element: AttributiveElement): element is DateDimension {
  return element.type === MetadataTypes.DateDimension;
}

/**
 * Creates a filter based on the selected attribute.
 */
const createFilter = (attributiveElement: AttributiveElement) => {
  const attribute = isDateDimension(attributiveElement)
    ? attributiveElement.Years
    : attributiveElement;
  return filterFactory.members(attribute, []);
};

const ThrownError = () => {
  throw new TranslatableError('errors.addFilterPopover.noDataSources');
};

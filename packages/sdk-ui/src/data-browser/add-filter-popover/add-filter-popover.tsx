import { Popover } from '@/common/components/popover';
import { useThemeContext } from '@/theme-provider/theme-context';
import { Themable } from '@/theme-provider/types';
import styled from '@emotion/styled';
import { DataSource, DateDimension, Filter, filterFactory, MetadataTypes } from '@sisense/sdk-data';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AttributiveElement } from '../dimensions-browser/types';
import { AddFilterDataBrowser } from './add-filter-data-browser';
import { PopoverHeader } from './popover-header';

type AddFilterPopoverProps = {
  anchorEl: HTMLElement;
  isOpen: boolean;
  onClose?: () => void;
  dataSources: DataSource[];
  initialDataSource: DataSource;
  onFilterCreated: (filter: Filter) => void;
};

const Container = styled.div<Themable>`
  width: 626px;
  height: 530px;
  display: flex;
  flex-direction: column;
`;

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
}: AddFilterPopoverProps) => {
  const { t } = useTranslation();
  const createFilter = useCallback((attributishElement: AttributiveElement) => {
    const attribute = isDateDimension(attributishElement)
      ? attributishElement.Years
      : attributishElement;
    return filterFactory.members(attribute, []);
  }, []);

  const handleAttributeClick = useCallback(
    (attribute: AttributiveElement) => {
      const filter = createFilter(attribute);
      onFilterCreated(filter);
    },
    [createFilter, onFilterCreated],
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
      <Container theme={themeSettings} data-testid="add-filter-popover">
        <PopoverHeader
          title={t('dataBrowser.addFilter')}
          flowPath={[
            { title: t('dataBrowser.selectField'), isCurrentStep: true },
            { title: t('dataBrowser.configureFilter'), isCurrentStep: false },
          ]}
          onClose={onClose}
        />
        <AddFilterDataBrowser
          dataSources={dataSources}
          initialDataSource={initialDataSource}
          onAttributeClick={handleAttributeClick}
        />
      </Container>
    </Popover>
  );
};

function isDateDimension(element: AttributiveElement): element is DateDimension {
  return element.type === MetadataTypes.DateDimension;
}

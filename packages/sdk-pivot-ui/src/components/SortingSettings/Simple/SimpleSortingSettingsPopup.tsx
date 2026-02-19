import React from 'react';

import { SortingDirection } from '@sisense/sdk-pivot-query-client';
import { CheckableList, type CheckableListProps } from '@sisense/sdk-shared-ui/CheckableList';
import { produce } from 'immer';

import { TranslatedMessages } from '../../../builders/pivot-builder.js';
import { makeGetCaption } from '../getCaption.js';
import { Header } from '../Header/index.js';
import { SortingSettingItem } from '../SortingSettingItem.js';

type Props = {
  titleOfPopUp: string[];
  currentSortingSettings: SortingSettingItem;
  onSortingSettingsUpdate: (s: SortingSettingItem) => void;
  messages: TranslatedMessages;
};

export const SimpleSortingSettingsPopup = (props: Props) => {
  const {
    titleOfPopUp,
    currentSortingSettings: settings,
    onSortingSettingsUpdate,
    messages,
  } = props;

  const getCaption = makeGetCaption(messages);

  const { datatype, direction } = settings;

  const handleChange = (dir: 'asc' | 'desc' | null): void => {
    const nextSettings = produce(settings, (draftSettings) => {
      draftSettings.selected = true;
      draftSettings.direction = dir;
    });

    onSortingSettingsUpdate(nextSettings);
  };

  return (
    <div className="sis-scope">
      <div className="simple-sorting-settings">
        <Header
          className="sorting-settings-header"
          prependedText={`${messages.sort} - `}
          hierarchy={titleOfPopUp}
        />
        <div className="simple-sorting-settings__actions">
          <CheckableList
            // @ts-ignore
            styles={{
              margin: '16px',
            }}
            onChange={handleChange as CheckableListProps['onChange']}
            items={[
              {
                name: `${messages.sort} ${getCaption(datatype, SortingDirection.ASC)}`,
                value: SortingDirection.ASC,
                checked: direction === SortingDirection.ASC,
                dataTestId: 'sort-ascending',
              },
              {
                name: `${messages.sort} ${getCaption(datatype, SortingDirection.DESC)}`,
                value: SortingDirection.DESC,
                checked: direction === SortingDirection.DESC,
                dataTestId: 'sort-descending',
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

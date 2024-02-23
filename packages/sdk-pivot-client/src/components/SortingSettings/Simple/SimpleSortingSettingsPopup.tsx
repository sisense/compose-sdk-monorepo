import React from 'react';
import { produce } from 'immer';
import { Header } from '../Header/index.js';
import { SortingDirection } from '../../../data-handling/constants.js';
import { TranslatedMessages } from '../../../builders/pivot-builder.js';
import { makeGetCaption } from '../getCaption.js';
import { SortingSettingItem } from '../SortingSettingItem.js';

// eslint-disable-next-line @typescript-eslint/no-var-requires
// const { CheckableList } = require('@sisense/shared-ui-components');

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
          <h1>CheckableList TODO</h1>
          {/*<CheckableList*/}
          {/*  styles={{*/}
          {/*    margin: '16px',*/}
          {/*  }}*/}
          {/*  onChange={handleChange}*/}
          {/*  items={[*/}
          {/*    {*/}
          {/*      name: `${messages.sort} ${getCaption(datatype, SortingDirection.ASC)}`,*/}
          {/*      value: SortingDirection.ASC,*/}
          {/*      checked: direction === SortingDirection.ASC,*/}
          {/*      dataTestId: 'sort-ascending',*/}
          {/*    },*/}
          {/*    {*/}
          {/*      name: `${messages.sort} ${getCaption(datatype, SortingDirection.DESC)}`,*/}
          {/*      value: SortingDirection.DESC,*/}
          {/*      checked: direction === SortingDirection.DESC,*/}
          {/*      dataTestId: 'sort-descending',*/}
          {/*    },*/}
          {/*  ]}*/}
          {/*/>*/}
        </div>
      </div>
    </div>
  );
};

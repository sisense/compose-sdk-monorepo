import React, { useState, MouseEventHandler, useRef, useLayoutEffect } from 'react';
import { produce } from 'immer';
import { Header } from '../Header/index.js';
import { SettingsItemComponent } from '../SettingsItem/index.js'; // TODO: rename folder to SettingsItemComponent
import { SortingDirection } from '../../../data-handling/constants.js';
import { TranslatedMessages } from '../../../builders/pivot-builder.js';
import { makeGetCaption } from '../getCaption.js';
import { SortingSettingItem } from '../SortingSettingItem.js';
import { detectElementOverflow } from '../detectElementOverflow.js';

// eslint-disable-next-line @typescript-eslint/no-var-requires
import { Button } from '../../../shared-ui-components/Button';

type Props = {
  titleOfPopUp: string[];
  currentSortingSettings: Array<SortingSettingItem>;
  onSortingSettingsUpdate: Function;
  onCrossIconClick: MouseEventHandler<HTMLSpanElement>;
  messages: TranslatedMessages;
};

export const ComplexSortingSettingsPopup = (props: Props) => {
  const {
    titleOfPopUp,
    currentSortingSettings: initialSortingSettings,
    onSortingSettingsUpdate,
    onCrossIconClick,
    messages,
  } = props;

  const getCaption = makeGetCaption(messages);

  const [settings, setSettings] = useState(initialSortingSettings);

  const handleApplyButtonClick = () => onSortingSettingsUpdate(settings);

  const handleClearSortingClick = () => {
    const updatedSettingsItemState = produce(settings, (settingsDraft) => {
      settingsDraft.forEach((item) => {
        item.direction = null;
        item.selected = false;
      });
    });

    onSortingSettingsUpdate(updatedSettingsItemState);
  };

  const handleSettingsItemChange = (itemState: Omit<SortingSettingItem, 'datatype'>) => {
    const updatedSettingsItemState = produce(settings, (settingsDraft) => {
      const index = settingsDraft.findIndex(({ title }) => itemState.title === title);
      if (index !== -1) {
        settingsDraft[index].selected = itemState.selected;
        settingsDraft[index].direction = itemState.direction;
        if (!itemState.selected) {
          settingsDraft[index].direction = null;
        }
      }
    });

    setSettings(updatedSettingsItemState);
  };

  const settingsItemsComponents = settings.map((settingsItemProps, index) => {
    const { datatype, selected, direction } = settingsItemProps;

    const { title } = settingsItemProps;

    const subtotalsCaption =
      index === settings.length - 1 ? null : (
        <span className="subtotals-caption">{messages.subtotals}</span>
      );

    const fieldTypes = [
      {
        caption: getCaption(datatype, SortingDirection.ASC),
        id: SortingDirection.ASC,
      },
      {
        caption: getCaption(datatype, SortingDirection.DESC),
        id: SortingDirection.DESC,
      },
    ];

    return (
      <SettingsItemComponent
        key={title}
        title={title}
        fieldTypes={fieldTypes}
        selected={selected}
        direction={direction}
        onSettingsItemStateChange={handleSettingsItemChange}
        subtotalsCaption={subtotalsCaption}
      />
    );
  });

  const someSettingsSelected = initialSortingSettings.some((itemProps) => itemProps.selected);
  const clearSortingButton = someSettingsSelected ? (
    <Button text={messages.clearSorting} gray onClick={handleClearSortingClick} />
  ) : null;

  const bodyRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLSpanElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [actionsDynamicStyles, setActionsDynamicStyles] = useState({});

  useLayoutEffect(
    () => {
      const bodyElement = bodyRef.current;
      if (bodyElement === null) {
        return;
      }

      const captionElement = captionRef.current;
      if (captionElement === null) {
        return;
      }

      const listElement = listRef.current;
      if (listElement === null) {
        return;
      }

      const isCaptionOverflowing = detectElementOverflow(captionElement, bodyElement);
      const isListOverflowing = detectElementOverflow(listElement, bodyElement);

      if (
        isListOverflowing.collidedBottom ||
        isCaptionOverflowing.collidedTop ||
        isListOverflowing.collidedTop ||
        isCaptionOverflowing.collidedBottom
      ) {
        setActionsDynamicStyles({
          borderTop: '1px #E7E8EA solid',
          paddingTop: '16px',
        });
      } else {
        setActionsDynamicStyles({});
      }
    },
    settings.map(({ selected }) => selected),
  );

  return (
    <div className="sis-scope">
      <div className="complex-sorting-settings">
        <Header
          className="sorting-settings-header"
          prependedText={messages.sortBy}
          hierarchy={titleOfPopUp}
          onCrossIconClick={onCrossIconClick}
        />
        <div ref={bodyRef} className="complex-sorting-settings__body">
          <span ref={captionRef} style={{ fontWeight: 600 }}>
            {messages.selectToSort}
          </span>
          <ul ref={listRef} className="settings-checkboxes">
            {settingsItemsComponents}
          </ul>
        </div>
        <div className="complex-sorting-settings__actions" style={actionsDynamicStyles}>
          <div className="sp-buttons">
            <Button onClick={handleApplyButtonClick} text={messages.apply} />
            {clearSortingButton}
          </div>
        </div>
      </div>
    </div>
  );
};

import type { Attribute, Column, MembersFilter } from '@sisense/sdk-data';
import {
  processDrilldownSelections,
  type DataPoint,
  type DrilldownSelection,
  type StyledColumn,
} from '@sisense/sdk-ui-preact';
import { ref, computed, type Ref } from 'vue';
import type { TFunction } from '@sisense/sdk-common';

/**
 * @internal
 */
export const useCustomDrilldown = ({
  drilldownDimensions,
  initialDimension,
}: {
  drilldownDimensions: Ref<Attribute[]>;
  initialDimension: Column | StyledColumn;
}) => {
  if (!initialDimension) {
    throw new Error(
      'Initial dimension has to be specified to use drilldown with custom components',
    );
  }

  const drilldownSelections = ref<DrilldownSelection[]>([]);
  const drilldownDimension = ref<Attribute>();
  const drilldownFilters = ref<MembersFilter[]>([]);
  const drilldownFiltersDisplayValues = ref<string[][]>([]);

  const availableDrilldowns = computed(() =>
    drilldownDimensions.value.filter(({ expression }) =>
      drilldownSelections.value.every(
        ({ nextDimension }) => nextDimension.expression !== expression,
      ),
    ),
  );

  const selectDrilldown = (points: DataPoint[], nextDimension: Attribute) => {
    drilldownSelections.value = [...drilldownSelections.value, { points, nextDimension }];
    updateDrilldownProps();
  };

  const sliceDrilldownSelections = (i: number) => {
    drilldownSelections.value = drilldownSelections.value.slice(0, i);
    updateDrilldownProps();
  };

  const clearDrilldownSelections = () => {
    drilldownSelections.value = [];
    updateDrilldownProps();
  };

  const updateDrilldownProps = () => {
    // todo: connect internationalization to vue
    const translate = ((key: string) =>
      key === 'drilldown.breadcrumbsAllSuffix' ? 'All' : key) as TFunction;
    const drilldownProps = processDrilldownSelections(
      drilldownSelections.value,
      initialDimension,
      translate,
    );
    drilldownDimension.value = drilldownProps.drilldownDimension;
    drilldownFilters.value = drilldownProps.drilldownFilters;
    drilldownFiltersDisplayValues.value = drilldownProps.drilldownFiltersDisplayValues;
  };

  updateDrilldownProps();
  return {
    selectDrilldown,
    sliceDrilldownSelections,
    clearDrilldownSelections,
    drilldownSelections,
    availableDrilldowns,
    drilldownDimension,
    drilldownFilters,
    drilldownFiltersDisplayValues,
  };
};

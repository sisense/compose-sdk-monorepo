import type { TFunction } from '@sisense/sdk-common';
import { type Attribute, type Column, type MembersFilter, MetadataTypes } from '@sisense/sdk-data';
import {
  type DataPoint,
  type DrilldownSelection,
  type Hierarchy,
  isSameAttribute,
  processDrilldownSelections,
  type StyledColumn,
  translateColumnToAttribute,
  updateDrilldownSelections,
} from '@sisense/sdk-ui-preact';
import { computed, ref, type Ref } from 'vue';

/**
 * @internal
 */
export const useCustomDrilldown = ({
  drilldownPaths,
  initialDimension,
}: {
  drilldownPaths: Ref<(Attribute | Hierarchy)[]>;
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

  const selectedAttributes = computed(() => [
    translateColumnToAttribute(initialDimension),
    ...drilldownSelections.value.map(({ nextDimension }) => nextDimension),
  ]);

  const availableDrilldownPaths = computed(() =>
    drilldownPaths.value.filter((drilldownPath) => {
      const isAttribute = MetadataTypes.isAttribute(drilldownPath);

      if (isAttribute) {
        const dimension = drilldownPath;
        return selectedAttributes.value.every(
          (selectedAttribute) => !isSameAttribute(selectedAttribute, dimension),
        );
      }

      const hierarchy = drilldownPath;
      return selectedAttributes.value.every((attribute, index) =>
        isSameAttribute(attribute, hierarchy.levels[index]),
      );
    }),
  );

  const selectDrilldown = (
    points: DataPoint[],
    nextDimension: Attribute,
    hierarchy?: Hierarchy,
  ) => {
    drilldownSelections.value = updateDrilldownSelections(
      drilldownSelections.value,
      points,
      nextDimension,
      hierarchy,
    );
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
    drilldownSelections,
    availableDrilldownPaths,
    drilldownDimension,
    drilldownFilters,
    drilldownFiltersDisplayValues,
    selectDrilldown,
    sliceDrilldownSelections,
    clearDrilldownSelections,
  };
};

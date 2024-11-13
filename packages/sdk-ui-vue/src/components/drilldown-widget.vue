<script lang="ts" setup>
import { computed, ref, toRefs } from 'vue';
import type { TFunction } from '@sisense/sdk-common';
import { getSelectionTitleMenuItem, getDrilldownMenuItems } from '@sisense/sdk-ui-preact';
import type { DataPoint, MenuPosition, Hierarchy } from '@sisense/sdk-ui-preact';
import { useCustomDrilldown } from '../composables/use-custom-drilldown';
import { ContextMenu } from './context-menu';
import { DrilldownBreadcrumbs } from './drilldown-breadcrumbs';
import type { Attribute } from '@sisense/sdk-data';
import { DrilldownWidgetTs } from './drilldown-widget';

const props = defineProps(DrilldownWidgetTs.props);

const { drilldownDimensions, drilldownPaths, initialDimension, config } = toRefs(props);

const position = ref<MenuPosition | null>(null);
const selectedDataPoints = ref<DataPoint[]>([]);
const fullDrilldownPaths = computed(
  () => [...drilldownPaths.value, ...drilldownDimensions.value] as (Attribute | Hierarchy)[],
);

const {
  drilldownFilters, // computed
  drilldownDimension, // computed
  drilldownFiltersDisplayValues, // computed
  availableDrilldownPaths, // computed
  selectDrilldown,
  sliceDrilldownSelections,
  clearDrilldownSelections,
} = useCustomDrilldown({
  drilldownPaths: fullDrilldownPaths,
  initialDimension: initialDimension.value,
});

const onMenuDrilldownClick = (nextDimension: Attribute) => {
  selectDrilldown(selectedDataPoints.value, nextDimension);
};

const itemSections = computed(() => {
  // todo: connect internationalization to vue
  const translate = ((key: string) =>
    key === 'drilldown.drillMenuItem' ? 'Drill' : key) as TFunction;
  return [
    getSelectionTitleMenuItem(selectedDataPoints.value, drilldownDimension.value!),
    getDrilldownMenuItems(
      availableDrilldownPaths.value,
      drilldownDimension.value!,
      onMenuDrilldownClick,
      translate,
    ),
  ];
});

const openContextMenu = (menuPos: { top: number; left: number }) => {
  position.value = menuPos;
};

const onDataPointsSelected = (points: DataPoint[]) => {
  selectedDataPoints.value = points;
};

const closeContextMenu = () => {
  position.value = null;
};
</script>
<template>
  <div style="display: flex; flex-direction: column; height: 100%">
    <slot name="contextMenu" v-bind:contextMenuProps="{ position, itemSections, closeContextMenu }">
      <ContextMenu
        :position="position"
        :itemSections="itemSections"
        :closeContextMenu="closeContextMenu"
      >
      </ContextMenu>
    </slot>
    <slot
      name="breadcrumbs"
      v-bind:drilldownBreadcrumbsProps="{
        clearDrilldownSelections,
        sliceDrilldownSelections,
        drilldownFiltersDisplayValues,
        drilldownDimension,
      }"
    >
      <DrilldownBreadcrumbs
        :clear-drilldown-selections="clearDrilldownSelections"
        :slice-drilldown-selections="sliceDrilldownSelections"
        :filters-display-values="drilldownFiltersDisplayValues"
        :current-dimension="drilldownDimension"
      >
      </DrilldownBreadcrumbs>
    </slot>
    <div style="flex-grow: 1; min-wdith: 0; min-height: 0">
      <slot
        name="chart"
        v-bind:drilldownFilters="drilldownFilters"
        v-bind:drilldownDimension="drilldownDimension"
        v-bind:onDataPointsSelected="onDataPointsSelected"
        v-bind:onContextMenu="openContextMenu"
      ></slot>
    </div>
  </div>
</template>

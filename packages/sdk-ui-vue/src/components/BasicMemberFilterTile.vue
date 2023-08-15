<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { PropType } from 'vue';
import {
  BasicMemberFilterTile as BasicMemberFilterTilePreact,
  preactRenderComponent,
} from '@sisense/sdk-ui-preact';
import type { BasicMemberFilterTileProps } from '@sisense/sdk-ui-preact';

/**
 * Wrapper component for the FilterTile preact component.
 *
 * @privateRemarks
 * `componentProps` is a workaround for https://github.com/vuejs/core/issues/4294#issuecomment-1316097560
 * See more details at https://github.com/vuejs/core/issues/4294#issuecomment-1025210436
 * A fix for this issue is expected in Vue 3.3.x
 *
 */
const componentProps = defineProps({
  props: Object as PropType<BasicMemberFilterTileProps>,
});

// declare a ref to hold the element reference
const refElement = ref<HTMLDivElement | null>(null);

onMounted(() => {
  if (!refElement.value) return;
  preactRenderComponent(refElement.value, BasicMemberFilterTilePreact, componentProps.props);
});
</script>

<template>
  <div ref="refElement" />
</template>

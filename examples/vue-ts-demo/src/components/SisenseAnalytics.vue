<script setup lang="ts">
import { BasicMemberFilterTile } from '@sisense/sdk-ui-vue';
import type { BasicMemberFilterTileProps } from '@sisense/sdk-ui-preact';

const props: BasicMemberFilterTileProps = {
  title: 'Filter by Category',
  allMembers: [
    'Bikes',
    'Body Armor',
    'Build Kits',
    'Cables & Housing',
    'Frames',
    'Helmets',
    'Wheels & Wheelsets',
  ].map((m) => ({
    key: m,
    title: m,
  })),
  initialSelectedMembers: ['Bikes', 'Wheels & Wheelsets'].map((m) => ({
    key: m,
    title: m,
  })),
  onUpdateSelectedMembers: (members: string[]) => {
    console.log('final selected, active members', members);
  },
};
</script>

<template>
  <BasicMemberFilterTile :props="props" />
</template>

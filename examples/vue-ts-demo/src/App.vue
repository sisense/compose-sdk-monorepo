<script setup lang="ts">
import { RouterView } from 'vue-router';
import TopBar from './components/TopBar.vue';

const siteName = 'Vue Retail';
</script>

<template>
  <TopBar :siteName="siteName" />
  <RouterView />
</template>

<template>
  <div class="page">
    <div class="tabs">
      <button v-for="t in tabs" :key="t" class="tab" :class="{ a: t===cur }" @click="$router.push('/'+t)">{{ t }}</button>
    </div>
    <div class="parchment">
      <div class="corner-fold"></div>
      <h3 class="head">状态</h3>
      <StatusPanel view="status" />
      <div class="tear"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import StatusPanel from '../组件/StatusPanel.vue';
const tabs = ['正文','状态','世界','角色','清单'];
const cur = '状态';
</script>

<style scoped>
@import './公共样式.scss';
.page { padding: 10px; }
</style>


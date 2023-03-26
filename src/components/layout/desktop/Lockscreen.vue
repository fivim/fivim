<template>
  <!-- desktop title bar -->
  <DesktopTitleBar :showExtButtons="false">
    <template #titleName>
      &nbsp;
    </template>
  </DesktopTitleBar>

  <Lockscreen class="lockscreen-size-limit"></Lockscreen>
</template>

<script setup lang="ts">
import DesktopTitleBar from '@/components/layout/desktop/titleBar/DesktopTitleBar.vue'
import Lockscreen from '@/components/widget/Lockscreen.vue'

</script>

<style lang="scss" scoped>
.lockscreen-size-limit {
  margin-top: var(--enas-desktop-title-bar-height);
  height: calc(100vh - var(--enas-desktop-title-bar-height) - 2px) !important;
}
</style>

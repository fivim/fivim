<template>
  <div class="tags small" v-if="tagsArr.length > 0">
    <template v-for="(ii, index) in tagsArr" v-bind:key="index">
      <!-- TODO Not elegant enough -->
      <span class="tag-btn" v-if="getTagData(ii).title">
        <label class="icon">{{ getTagData(ii).icon }} </label>
        <span>{{ getTagData(ii).title }}</span>
      </span>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { getTagData } from '@/utils/pinia_related'

const props = defineProps({
  tagsArr: {
    type: Array<string>,
    default: () => ([])
  }
})
</script>

<style lang="scss">
@import '@/components/pane/common.scss';
</style>

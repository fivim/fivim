<template>
  <XPopover refId="notebookIconBtnPop" placement="bottom-start" trigger="click" :propTitle="t('Icon')" :widthAuto="true">
    <template #reference>
      <el-button v-if="useIcon" :icon="CollectionTag" circle />
      <el-button v-else>{{ t('Tag') }}</el-button>
    </template>

    <template v-if="paneDataStore.data.navigationCol.tags.length > 0">
      <div v-for="(item, index) in paneDataStore.data.navigationCol.tags" v-bind:key="index">
        <div class="py-2" @click="onClick(item)">
          <span :class="`${tagExist(item.hashedSign) ? 'font-bold' : ''}`">
            {{ item.icon }}{{ item.title }}
          </span>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="empty py-12"> {{ t('&No content') }} </div>
    </template>
  </XPopover>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { CollectionTag } from '@element-plus/icons-vue'

import XPopover from '@/components/UI_component/x_popover.vue'
import { Tag } from '@/components/pane/types'
import { usePaneDataStore } from '@/pinia/modules/pane_data'

const props = defineProps({
  tagExist: {
    type: Function,
    required: true
  },
  useIcon: {
    type: Boolean
  }
})

// For better code hints. Refer: https://juejin.cn/post/7012814138145505287
interface emitType {
  (e: 'onClick', value: Tag): void
}

const emits = defineEmits<emitType>()
const { t } = useI18n()
const paneDataStore = usePaneDataStore()

const onClick = (detail: Tag) => {
  emits('onClick', detail)
}
</script>

<style lang="scss"></style>

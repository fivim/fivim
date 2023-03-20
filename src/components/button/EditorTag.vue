<template>
  <XPopover refId="changeEditorBtnPop" placement="top-start" trigger="click" :propTitle="t('Tag')">
    <template #reference>
      <el-button :icon="CollectionTag" circle />
    </template>

    <template v-if="paneDataStore.data.navigationCol.tags.length > 0">
      <div v-for="(item, index) in paneDataStore.data.navigationCol.tags" v-bind:key="index">
        <div class="py-2 cur-ptr" @click="onNoteAddTag(item)">
          {{ item.icon }}{{ item.title }}
        </div>
      </div>
    </template>
    <template v-else>
      <div class="empty py-12"> {{ t('&No content') }} </div>
    </template>
  </XPopover>
</template>

<script lang="ts" setup>
import { CollectionTag } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

import { Tag } from '@/components/pane/types'
import { useAppStore } from '@/pinia/modules/app'
import { usePaneDataStore } from '@/pinia/modules/pane_data'
import XPopover from '@/components/xPopover/popover.vue'

const { t } = useI18n()
const appStore = useAppStore()
const paneDataStore = usePaneDataStore()

const onNoteAddTag = (detail: Tag) => {
  const currentFileHashedSign = appStore.data.currentFile.hashedSign
  const paneData = paneDataStore.data
  for (const i of paneData.listCol.list) {
    if (i.hashedSign === currentFileHashedSign) {
      let exist = false
      // If tag exist, remove it
      for (let index = 0; index < i.tagsArr.length; index++) {
        if (i.tagsArr[index] === detail.hashedSign) {
          exist = true
          i.tagsArr.splice(index, 1)
        }
      }
      if (!exist) {
        i.tagsArr.push(detail.hashedSign)
      }
    }
  }
  paneDataStore.setData(paneData)
}
</script>

<style lang="scss">

</style>

<template>
  <XPopover refId="editorActionBtnPop" placement="bottom-start" trigger="click" :propTitle="t('Icon')" :widthAuto="true">
    <template #reference>
      <el-button :icon="MoreFilled" circle />
    </template>

    <div class="py-2 cur-ptr">
      <template v-if="isNote()">
        <div @click="onClickNote()">{{ t('Delete') }}</div>
      </template>
      <template v-else-if="isFile()">
        <div @click="onClickFile()">{{ t('Delete') }}</div>
      </template>
    </div>

  </XPopover>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessageBox } from 'element-plus'
import { MoreFilled } from '@element-plus/icons-vue'

import { invoker } from '@/libs/commands/invoke'
import { getDataDirs } from '@/libs/init/dirs'
import { FileInfo } from '@/libs/user_data/types'
import { tmplFileInfo } from '@/libs/user_data/types_templates'
import { deleteFileMeta } from '@/libs/user_data/utils'
import XPopover from '@/components/widget/XPopover.vue'
import { useAppStore } from '@/pinia/modules/app'
import { isNote, isFile, restEditorCol } from '@/utils/pinia_related'
import { jsonCopy } from '@/utils/utils'

const appStore = useAppStore()
const { t } = useI18n()

// ---------- note ---------
const onClickNote = () => {
  ElMessageBox.confirm(t('&confirm delete note?', { name: fileInfo.value.title }))
    .then(async () => {
      const ad = appStore.data
      ad.listCol.listOfNote.splice(ad.currentFile.indexInList, 1)
      appStore.setData(ad)

      restEditorCol()
    })
    .catch(() => {
      // catch error
    })
}
// ---------- note end ---------

// ---------- file ---------
const fileInfo = ref<FileInfo>(jsonCopy(tmplFileInfo))

const getFileInfo = async () => {
  const ad = appStore.data
  const file = ad.userData.files[ad.currentFile.indexInList] as FileInfo
  fileInfo.value = file
}

const onClickFile = () => {
  getFileInfo()

  ElMessageBox.confirm(t('&confirm delete file?', { name: fileInfo.value.title }))
    .then(async () => {
      if (fileInfo.value.sign) {
        const p = await getDataDirs()

        invoker.deleteFile(p.pathOfCurrentDir + fileInfo.value.sign).then((success) => {
          if (success) {
            doDeleteFile(fileInfo.value.sign)
          } else {
            ElMessageBox.confirm(
              t('&confirm delete file information'),
              t('Warning'),
              {
                confirmButtonText: t('OK'),
                cancelButtonText: t('Cancel'),
                type: 'warning'
              }
            )
              .then(() => {
                doDeleteFile(fileInfo.value.sign)
              })
              .catch(() => {
                //
              })
          }
        })
      } else {
        // TODO alert
      }
    })
    .catch(() => {
      // catch error
    })
}

const doDeleteFile = (fileName: string) => {
  const ad = appStore.data
  ad.userData.files.splice(ad.currentFile.indexInList, 1)
  appStore.setData(ad)

  deleteFileMeta(fileName)
  restEditorCol()
}
// ---------- file end ---------
</script>

<style lang="scss"></style>

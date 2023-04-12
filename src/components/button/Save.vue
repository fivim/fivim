<template>
  <div class="btn" v-if="showBtn()">
    <el-button size="small" link @click="onSave">
      <SaveOutlined />
    </el-button>
  </div>
</template>

<script lang="ts" setup>
import { SaveOutlined } from '@ant-design/icons-vue'

import { useAppStore } from '@/pinia/modules/app'
import { saveCurrentNotebookData, saveToEntryFile } from '@/libs/user_data/utils'
import { TypeNote, TypeFile } from '@/constants'

const appStore = useAppStore()
const ad = appStore.data

const onSave = async () => {
  if (ad.currentFile.type === TypeNote) {
    await saveCurrentNotebookData(true)
  } else if (ad.currentFile.type === TypeFile) {
    saveToEntryFile()
  }
}

const showBtn = () => [TypeNote, TypeFile].indexOf(ad.currentFile.type) >= 0
</script>

<style lang="scss"></style>

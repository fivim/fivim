<template>
  <template v-if="appStore.data.listCol.type === TypeFile">
    <el-button :icon="Plus" @click="onAddFile" circle />
    <!-- <el-button :icon="Plus" /> -->
  </template>
  <template v-else-if="appStore.data.listCol.type === TypeNote">
    <XPopover refId="listAddBtnPop" placement="top-start" trigger="click" :propTitle="t('Add')">
      <template #reference>
        <el-button :icon="Plus" circle />
      </template>

      <div class="enas-list">
        <div class="list-item" @click="onAddNote">
          <FileTextOutlined /> {{ t('Note') }}
        </div>
      </div>
    </XPopover>
  </template>

  <!-- add file dialog -->
  <el-dialog v-model="tempAddFile.visible" :title="t('Add file')" :width="genDialogWidth()">
    <el-form :model="appStore.data" label-width="150px">
      <el-form-item :label="t('File')">
        <div class="w-full">
          <el-button @click="onAddFileSelectFIle">{{ t('Select') }}</el-button>
        </div>
        <div class="w-full">
          <template v-for="(item, index) in tempAddFile.pathArr" v-bind:key="index">
            <div>{{ item }}</div>
          </template>
        </div>
      </el-form-item>
      <el-form-item :label="t('Tag')">
        <SelectTagButton :tagExist="tagExist" :useIcon="true" @onClick="onClickTag" />
        <div class="w-full pt-2">
          <SmallTagList :tagsArr="tempAddFile.tagsArr"></SmallTagList>
        </div>
      </el-form-item>
      <el-form-item :label="t('Remark')">
        <el-input v-model="tempAddFile.remark" type="textarea" :rows="5" />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="tempAddFile.visible = false">{{ t('Cancel') }}</el-button>
        <el-button type="primary" @click="onAddFileConfirm">
          {{ t('Confirm') }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { FileTextOutlined } from '@ant-design/icons-vue'
import { useI18n } from 'vue-i18n'
import { open as openDialog } from '@tauri-apps/api/dialog'

import XPopover from '@/components/widget/XPopover.vue'
import SelectTagButton from '@/components/button/SelectTag.vue'
import SmallTagList from '@/components/widget/SmallTagList.vue'

import { ExtDataPathInfo, MessagesInfo } from '@/types'
import { TypeNote, TypeFile, TaskEncrypt } from '@/constants'
import { useAppStore } from '@/pinia/modules/app'
import { NoteInfo, TagInfo } from '@/libs/user_data/types'
import { getDataDirs } from '@/libs/init/dirs'
import { genFilePwd } from '@/libs/commands'
import { invoker } from '@/libs/commands/invoke'
import { saveToEntryFile, addFileMeta } from '@/libs/user_data/utils'
import { genFileName, getFileNameFromPath, listenProgressStatus } from '@/utils/pinia_related'
import { genUuidv4 } from '@/utils/hash'
import { genDialogWidth } from '@/utils/utils'

const appStore = useAppStore()
const { t } = useI18n()

// ---------- add note ----------
const addItem = (itemType: typeof TypeNote) => {
  const ad = appStore.data
  if (ad.userData.notebooks.length === 0) {
    ElMessage({
      message: t('&Please add notebook first.'),
      type: 'warning',
      showClose: true
    })

    return
  }

  const newItem: NoteInfo = {
    sign: genFileName(),
    title: t('Untitled'),
    icon: '',
    type: itemType,
    content: '',
    mtimeUtc: new Date(),
    ctimeUtc: new Date(),
    tagsArr: []
  }

  ad.listCol.listOfNote.push(newItem)
  ad.currentFile.title = newItem.title
  ad.currentFile.content = newItem.content
  ad.currentFile.sign = newItem.sign
  ad.currentFile.indexInList = appStore.data.listCol.listOfNote.length - 1
  ad.currentFile.type = newItem.type
  appStore.setData(ad)
}

const onAddNote = () => {
  addItem(TypeNote)
}
// ---------- add note ----------

// ---------- add file ----------
const tempAddFile = ref({
  visible: false,
  pathArr: [] as string[],
  remark: '',
  tagsArr: [] as string[]
})

const onAddFile = () => {
  tempAddFile.value.visible = true
}

const onAddFileConfirm = async () => {
  tempAddFile.value.visible = false
  const p = await getDataDirs()

  for (const item of tempAddFile.value.pathArr) {
    doAddFile(item, p, genFileName())
  }
}

const onAddFileSelectFIle = () => {
  openDialog({
    // multiple: true
  }).then((selected) => {
    if (Array.isArray(selected)) {
      // user selected multiple files
      tempAddFile.value.pathArr = selected
    } else if (selected === null) {
      // user cancelled the selection
    } else {
      // user selected a single file
      tempAddFile.value.pathArr = [selected]
    }
  })
}

const doAddFile = async (sourcePath: string, p: ExtDataPathInfo, fileName: string) => {
  // progress bar
  if (appStore.data.currentProgress.percent > 0) {
    ElMessage(t(MessagesInfo.FileStillInProgress))
    return
  }
  const progressName = genUuidv4()
  listenProgressStatus(progressName, TaskEncrypt)

  const dir = p.pathOfCurrentDir
  invoker.writeUserDataFile(genFilePwd(''), dir + fileName, fileName, {}, sourcePath, progressName).then(async (success) => {
    if (success) {
      const ad = appStore.data
      if (!ad.userData.files) {
        ad.userData.files = []
      }

      const originalFileMeta = await invoker.getFileMeta(sourcePath)
      ad.userData.files.push({
        content: tempAddFile.value.remark,
        sign: fileName,
        title: getFileNameFromPath(sourcePath),
        tagsArr: tempAddFile.value.tagsArr,
        ctimeUtc: new Date(),
        mtimeUtc: new Date(),
        type: TypeFile,
        originalSize: originalFileMeta.size,
        originalSha256: originalFileMeta.sha256
      })

      appStore.setData(ad)
      addFileMeta(dir, fileName)
      saveToEntryFile()
    }
  })
}

const tagExist = (sign: string) => {
  return tempAddFile.value.tagsArr.indexOf(sign) >= 0
}

const onClickTag = (detail: TagInfo) => {
  const index = tempAddFile.value.tagsArr.indexOf(detail.sign)

  if (index >= 0) { // If exist delete it
    tempAddFile.value.tagsArr.splice(index, 1)
  } else {
    tempAddFile.value.tagsArr.push(detail.sign)
  }
}
// ---------- add file end ----------
</script>

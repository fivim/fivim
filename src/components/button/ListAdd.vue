<template>
  <template v-if="appStore.data.listCol.type === TypeFile">
    <el-button :icon="Plus" @click="onAddFile" circle />
    <!-- <el-button :icon="Plus" /> -->
  </template>
  <template v-else-if="appStore.data.listCol.type === TypeNote">
    <XPopover refId="listAddBtnPop" placement="top-start" trigger="click" :propTitle="t('Add')">
      <template #reference>
        <ElButton :icon="Plus" circle />
      </template>

      <div class="enas-list">
        <div class="list-item" @click="onAddNote">
          <FileTextOutlined /> {{ t('Note') }}
        </div>
      </div>
    </XPopover>
  </template>

  <!-- add file dialog -->
  <el-dialog v-model="tempAddFile.visible" :title="t('Add')" :width="genDialogWidth()">
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
import { ElMessage, ElLoading } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { FileTextOutlined, TableOutlined } from '@ant-design/icons-vue'
import { useI18n } from 'vue-i18n'
import { open as openDialog } from '@tauri-apps/api/dialog'

import XPopover from '@/components/widget/XPopover.vue'
import SelectTagButton from '@/components/button/SelectTag.vue'
import SmallTagList from '@/components/widget/SmallTagList.vue'

import { ExtDataPathInfo } from '@/types'
import { TypeNote, TypeFile } from '@/constants'
import { useAppStore } from '@/pinia/modules/app'
import { NoteInfo, TagInfo } from '@/libs/user_data/types'
import { getDataDirs } from '@/libs/init/dirs'
import { genFilePwd } from '@/libs/commands'
import { invoker } from '@/libs/commands/invoke'
import { saveToEntryFile, addFileMeta } from '@/libs/user_data/utils'
import { genFileName, getFileNameFromPath } from '@/utils/pinia_related'
import { genDialogWidth } from '@/utils/utils'

// import AddFileWorker from '@/libs/worker/add_file.ts?worker'
// import { AddFileEventParam } from '@/libs/worker/types'

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

  ad.listCol.noteList.push(newItem)
  ad.currentFile.title = newItem.title
  ad.currentFile.content = newItem.content
  ad.currentFile.sign = newItem.sign
  ad.currentFile.indexInList = appStore.data.listCol.noteList.length - 1
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
  const dir = p.pathOfCurrentDir

  // TODO writeUserDataFile will be blocked !!! Show a Loading
  const loadingInstance = ElLoading.service({ fullscreen: true, text: t('Processing'), background: 'var(--enas-background-primary-color)' })
  invoker.writeUserDataFile(genFilePwd(''), dir + fileName, fileName, {}, sourcePath).then(async (success) => {
    if (success) {
      loadingInstance.close()

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

  // TODO test using worker
  // const worker = new AddFileWorker()
  // const param: AddFileEventParam = {
  //   pwd: genFilePwd(''),
  //   path: dir + fileName,
  //   fileName,
  //   sourcePath
  // }
  // worker.postMessage(param)
  // worker.onmessage = function (event) {
  //   console.log('>>> worker returns ::', event)
  // }
  // console.log('>>> worker end ::')
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

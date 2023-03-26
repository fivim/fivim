<template>
  <div class="px-2 pb-2">
    <el-button :icon="Plus" size="small" @click="onAdd">{{ t('Add') }}</el-button>
    <!--
    <el-button :icon="Share" size="small" @click="onShareFile">{{ t('Share') }}</el-button>
    -->

    <el-dialog v-model="visibleAdd" :title="t('Add')" :width="genDialogWidth()">
      <el-form :model="settingStore.data" label-width="150px">
        <el-form-item :label="t('File')">
          <div class="w-full">
            <el-button @click="onAddSelectFIle">{{ t('Select') }}</el-button>
          </div>
          <div class="w-full">
            <template v-for="(item, index) in addFilePathArr" v-bind:key="index">
              <div>{{ item }}</div>
            </template>
          </div>
        </el-form-item>
        <el-form-item :label="t('Tag')">
          tag
        </el-form-item>
        <el-form-item :label="t('Remark')">
          <el-input v-model="addRemark" type="textarea" :rows="5" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="visibleAdd = false">{{ t('Cancel') }}</el-button>
          <el-button type="primary" @click="onAddConfirm">
            {{ t('Confirm') }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- share -->
    <el-dialog v-model="visibleShare" :title="t('Share')" :width="genDialogWidth()">
      <el-form :model="settingStore.data" label-width="150px">
        <el-form-item :label="t('File')">
          <div class="w-full">
            <el-button @click="onShareSelectFIle">{{ t('Select') }}</el-button>
          </div>
          <div class="w-full">
            <template v-for="(item, index) in addFilePathArr" v-bind:key="index">
              <div>{{ item }}</div>
            </template>
          </div>
        </el-form-item>
        <el-form-item :label="t('Output directory')">
          <div class="w-full">
            <el-button @click="onShareSelectOutPutDir">{{ t('Select') }}</el-button>
          </div>
          <div class="w-full">
            <template v-for="(item, index) in addFilePathArr" v-bind:key="index">
              <div>{{ item }}</div>
            </template>
          </div>
        </el-form-item>
        <el-form-item :label="t('Remark')">
          <el-input v-model="shareRemark" type="textarea" :rows="5" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="visibleAdd = false">{{ t('Cancel') }}</el-button>
          <el-button type="primary" @click="onShareConfirm">
            {{ t('Confirm') }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElLoading } from 'element-plus'
import { Plus, Share } from '@element-plus/icons-vue'
import { open as openDialog } from '@tauri-apps/api/dialog'

import { ExtDataPath } from '@/types'
import { TypeFile } from '@/constants'
import { useAppStore } from '@/pinia/modules/app'
import { usePanesStore } from '@/pinia/modules/panes'
import { useSettingStore } from '@/pinia/modules/settings'
import { getDataDirs } from '@/libs/init/dirs'
import { CmdInvoke } from '@/libs/commands'
import { saveToEntryFile } from '@/libs/user_data/utils'
import { stringToUint8Array } from '@/utils/string'
import { genFileName, getFileNameFromPath } from '@/utils/pinia_related'
import { grnDialogWidth as genDialogWidth } from '@/utils/utils'

const appStore = useAppStore()
const panesStore = usePanesStore()
const settingStore = useSettingStore()
const { t } = useI18n()

// ---------- add ----------
const visibleAdd = ref(false)
const addFilePathArr = ref<string[]>([])
const addRemark = ref('')

const onAdd = () => {
  visibleAdd.value = true
}

const onAddConfirm = async () => {
  visibleAdd.value = false
  const p = await getDataDirs()

  for (const item of addFilePathArr.value) {
    doAddFile(item, p, genFileName())
  }
}

const onAddSelectFIle = () => {
  openDialog({
    // multiple: true
  }).then((selected) => {
    if (Array.isArray(selected)) {
      // user selected multiple files
      addFilePathArr.value = selected
    } else if (selected === null) {
      // user cancelled the selection
    } else {
      // user selected a single file
      addFilePathArr.value = [selected]
    }
  })
}

const doAddFile = async (sourcePath: string, p: ExtDataPath, fileName: string) => {
  const dir = p.pathOfCurrentDir
  // TODO writeUserDataFile will be blocked !!! Show a Loading
  const loadingInstance = ElLoading.service({ fullscreen: true, text: t('Processing'), background: 'var(--enas-background-primary-color)' })
  CmdInvoke.writeUserDataFile('', dir + fileName, fileName, stringToUint8Array(''), sourcePath).then(async (success) => {
    if (success) {
      loadingInstance.close()

      const pdn = panesStore.data.navigationCol
      if (!pdn.files) {
        pdn.files = []
      }
      pdn.files.push({
        content: addRemark.value,
        sign: fileName,
        title: getFileNameFromPath(sourcePath),
        tagsArr: [],
        ctimeUtc: new Date(),
        mtimeUtc: new Date(),
        dtimeUtc: new Date(0),
        sha256: await CmdInvoke.sha256ByFilePath(dir + fileName),
        type: TypeFile,
        size: 0 // TODO
      })
      panesStore.setNavigationColData(pdn)

      saveToEntryFile()
    }
  })
}

// ---------- add end ----------

// ---------- share ----------
const visibleShare = ref(false)
const shareFilePathArr = ref<string[]>([])
const shareOutPutDir = ref('')
const shareRemark = ref('')

const onShareFile = () => {
  visibleShare.value = true
}

const onShareConfirm = async () => {
  visibleAdd.value = false
  const p = await getDataDirs()

  for (const item of addFilePathArr.value) {
    // doShareFile(item, p)
    // TODO
  }
}
const onShareSelectFIle = () => {
  openDialog({
    multiple: true
  }).then((selected) => {
    if (Array.isArray(selected)) {
      // user selected multiple files
      shareFilePathArr.value = selected
    } else if (selected === null) {
      // user cancelled the selection
    } else {
      // user selected a single file
      shareFilePathArr.value = [selected]
    }
  })
}

const onShareSelectOutPutDir = () => {
  openDialog({
    directory: true
  }).then((selected) => {
    shareOutPutDir.value = selected as string
  })
}
// ---------- share end ----------
</script>

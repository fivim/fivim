<template>
  <div class="navigation-column">
    <!--
    <div id="web-nav-btns" v-if="isWebPage()">
      <SettingButton />
      <ThemeButton />
    </div>
    -->

    <div class="navigation-pane">
      <section class="section">

        <!-- Notebooks -->
        <div class="section-title-bar">
          <div class="section-title-bar-header">
            <div class="title text-sm">
              <span class="font-bold">{{ t('Notebook') }}</span>
            </div>
            <div class="right">
              <el-button :icon="Plus" size="small" color="var(--enas-border-color)" circle
                @click="tempNb.visible = true" />
            </div>
          </div>
        </div>

        <template v-if="appStore.data.userData.notebooks.length > 0">
          <div class="nb-name" v-for="(item, index) in appStore.data.userData.notebooks" v-bind:key="index">
            <div :class="appStore.data.navCol.sign === item.sign ? 'info item-selected' : 'info'">
              <div class="icon" @click="onListNb(index)">
                {{ item.icon }}
              </div>
              <div class="title" @click="onListNb(index)">
                {{ item.title }}
              </div>
              <div class="action">
                <DeleteOutlined @click="onDeleteNotebook(item)" />
                <span>&nbsp;</span>
                <EditOutlined @click="onOpenDialogNb(item)" />
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="empty py-2"> {{ t('&No content') }} </div>
        </template>

        <!-- Tags -->
        <div class="section-title-bar mb-2">
          <div class="section-title-bar-header">
            <div class="title text-sm">
              <span class="font-bold">{{ t('Tag') }}</span>
            </div>
            <div class="right">
              <el-button :icon="Plus" size="small" color="var(--enas-border-color)" circle
                @click="tempTag.visible = true" />
            </div>
          </div>
        </div>
        <template v-if="appStore.data.userData.tags.length > 0">
          <div class="tags">
            <template v-for="(item, index) in appStore.data.userData.tags" v-bind:key="index">
              <el-popover placement="left-start" trigger="click">
                <template #reference>
                  <span class="tag-btn m-2">
                    <label class="icon">{{ item.icon }} </label>
                    <span>{{ item.title }}</span>
                  </span>
                </template>

                <div class="enas-list cur-ptr">
                  <div class="list-item" @click="onOpenDialogTag(item)"> {{ t('Edit') }} </div>
                  <div class="list-item" @click="onDeleteTag(item)"> {{ t('Delete') }} </div>
                </div>
              </el-popover>
            </template>
          </div>
        </template>
        <template v-else>
          <div class="empty py-2"> {{ t('&No content') }} </div>
        </template>
      </section>
    </div>

    <div class="bottom-action">
      <div :class="appStore.data.navCol.sign === TypeFile ? 'disp-flex item-selected' : 'disp-flex'" @click="onListFiles">
        <span class="font-bold">{{ t('File safe') }}</span>
        <div class="disp-flex flex-grow justify-content-right">
          <el-icon>
            <ArrowRight />
          </el-icon>
        </div>
      </div>
    </div>

    <slot name="default"></slot>

    <!-- Notebook dialog -->
    <el-dialog v-model="tempNb.visible" :title="getDialogTitleAddEditNb()" @closed="resetTempNb">
      <el-input v-model="tempNb.title" />

      <div class="py-2">
        <SelectEmojiButton :icon="tempNb.icon" @onClick="onNbEmojiClick"></SelectEmojiButton>
        <SelectTagButton :tagExist="tempNbTagExist" :useIcon="false" @onClick="onClickNbTag"> </SelectTagButton>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="tempNb.visible = false">{{ t('Cancel') }}</el-button>
          <el-button type="primary" @click="onDialogConfirmNb">
            {{ t('Confirm') }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Tag dialog -->
    <el-dialog v-model="tempTag.visible" :title="getDialogTitleAddEditTag()" @closed="resetTempTag">
      <el-input v-model="tempTag.text" />

      <div class="py-2">
        <SelectEmojiButton :icon="tempTag.icon" @onClick="onTagEmojiClick"></SelectEmojiButton>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="tempTag.visible = false">{{ t('Cancel') }}</el-button>
          <el-button type="primary" @click="onDialogConfirmTag">
            {{ t('Confirm') }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import { Plus, ArrowRight } from '@element-plus/icons-vue'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons-vue'
import { EmojiClickEventDetail } from 'vuemoji-picker'
import { useI18n } from 'vue-i18n'

import SelectEmojiButton from '@/components/button/SelectEmoji.vue'
import SelectTagButton from '@/components/button/SelectTag.vue'

import { TypeFile, TypeNote, TypeTag } from '@/constants'
import { useAppStore } from '@/pinia/modules/app'
import { getDataDirs } from '@/libs/init/dirs'
import { CmdAdapter } from '@/libs/commands'
import {
  saveCurrentNotebookAndCreateNotebookFile, deleteNotebook, deleteTag,
  readNotebookdata, addFileMeta, updateFileMeta, saveToEntryFile, saveCurrentNotebookData
} from '@/libs/user_data/utils'
import { NoteInfo, NotebookInfo, TagInfo } from '@/libs/user_data/types'
import { genFileName, restEditorCol } from '@/utils/pinia_related'
import { CurrentFileInfo } from './types'

const { t } = useI18n()
const appStore = useAppStore()

const isWebPage = () => {
  return appStore.data.isWebPage
}

const DIALOG_TYPE_ADD = 'ADD'
const DIALOG_TYPE_EDIT = 'EDIT'

// ---------- add / edit notebook ----------
const tempNb = ref({
  dialogType: DIALOG_TYPE_ADD,
  visible: false,
  sign: '',
  icon: '',
  title: '',
  tagsSign: [] as string[]
})

const resetTempNb = () => {
  tempNb.value.title = ''
  tempNb.value.icon = ''
  tempNb.value.dialogType = DIALOG_TYPE_ADD
  tempNb.value.visible = false
  tempNb.value.sign = ''
  tempNb.value.tagsSign = []
}

const onDialogConfirmNb = async () => {
  tempNb.value.visible = false
  const ad = appStore.data
  const p = await getDataDirs()

  if (tempNb.value.dialogType === DIALOG_TYPE_ADD) {
    const sign = genFileName()
    ad.userData.notebooks.push({
      title: tempNb.value.title,
      icon: tempNb.value.icon,
      sign,
      ctimeUtc: new Date(),
      mtimeUtc: new Date(),
      tagsArr: tempNb.value.tagsSign
    })

    resetTempNb()

    // Save new notebook data file at first, then open it.
    if (await saveCurrentNotebookAndCreateNotebookFile(sign)) {
      addFileMeta(p.pathOfCurrentDir, sign)
      onListNb(ad.userData.notebooks.length - 1)
    }
  } else if (tempNb.value.dialogType === DIALOG_TYPE_EDIT) {
    for (const i of ad.userData.notebooks) {
      if (i.sign === tempNb.value.sign) {
        i.icon = tempNb.value.icon
        i.title = tempNb.value.title
        i.mtimeUtc = new Date()
        // i.tagsArr = tempNbTagHashedSign.value // It has been directly modified when operating the tag
        break
      }
    }

    appStore.setData(ad)

    // update file meta
    if (await saveToEntryFile()) {
      updateFileMeta(tempNb.value.sign)
    }
  }
}

const onNbEmojiClick = (detail: EmojiClickEventDetail) => {
  tempNb.value.icon = detail.unicode || ''
}

const onOpenDialogNb = (detail: NotebookInfo) => {
  tempNb.value.dialogType = DIALOG_TYPE_EDIT
  tempNb.value.visible = true
  tempNb.value.title = detail.title
  tempNb.value.icon = detail.icon
  tempNb.value.sign = detail.sign
}

const onClickNbTag = (detail: TagInfo) => {
  const sign = detail.sign
  if (tempNb.value.dialogType === DIALOG_TYPE_ADD) {
    const arr = tempNb.value.tagsSign
    const index = arr.indexOf(sign)

    if (index >= 0) { // If exist delete it
      arr.splice(index, 1)
      tempNb.value.tagsSign = arr
    } else {
      tempNb.value.tagsSign.push(sign)
    }
  } else if (tempNb.value.dialogType === DIALOG_TYPE_EDIT) {
    const ad = appStore.data
    for (let index = 0; index < ad.userData.notebooks.length; index++) {
      const nb = ad.userData.notebooks[index]
      if (nb.sign === tempNb.value.sign) {
        const arr = nb.tagsArr
        const ih = arr.indexOf(sign)

        if (ih >= 0) { // If exist delete it
          arr.splice(ih, 1)
        } else {
          arr.push(sign)
        }
        ad.userData.notebooks[index].tagsArr = arr
      }
    }
    appStore.setData(ad)
  }
}

const getDialogTitleAddEditNb = () => {
  return tempNb.value.dialogType === DIALOG_TYPE_EDIT ? t('Edit notebook') : t('Add notebook')
}

const tempNbTagExist = (sign: string) => {
  if (tempNb.value.dialogType === DIALOG_TYPE_ADD) {
    if (tempNb.value.tagsSign.indexOf(sign) >= 0) {
      return true
    }
  } else if (tempNb.value.dialogType === DIALOG_TYPE_EDIT) {
    for (const nb of appStore.data.userData.notebooks) {
      if (nb.sign === tempNb.value.sign && nb.tagsArr.indexOf(sign) >= 0) {
        return true
      }
    }
    return false
  }
}

const onListNb = async (index: number) => {
  if (!await saveCurrentNotebookData(false)) {
    return
  }

  const ad = appStore.data
  const nb = ad.userData.notebooks[index]
  const currentFile: CurrentFileInfo = {
    content: '',
    sign: nb.sign,
    subSign: '',
    tagsArr: [],
    title: '',
    type: TypeNote
  }

  readNotebookdata(nb.sign).then((notes) => {
    appStore.setListColData({
      title: nb.title,
      icon: nb.icon,
      sign: nb.sign,
      tagsArr: nb.tagsArr,
      type: TypeNote,
      listOfNote: notes,
      listOfTag: []
    })

    ad.navCol.sign = nb.sign
    ad.currentFile = currentFile
    appStore.setData(ad)
  }).catch((err: Error) => {
    const typeName = t('Notebook')
    CmdAdapter().notification(t('&Error initializing file', { name: typeName }), t(err.message), '')
    return false
  })
}

const onDeleteNotebook = (detail: NotebookInfo) => {
  ElMessageBox.confirm(
    t('&delete notebook comfirm tip', { name: detail.title }),
    t('Warning'),
    {
      confirmButtonText: t('OK'),
      cancelButtonText: t('Cancel'),
      type: 'warning'
    }
  )
    .then(() => {
      deleteNotebook(detail.sign)
    })
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    .catch(() => { })
}
// ---------- add / edit notebook end ----------

// ---------- add / edit tag ----------
const tempTag = ref({
  dialogType: DIALOG_TYPE_ADD,
  visible: false,
  text: '',
  icon: '',
  tagsSign: ''
})

const onDialogConfirmTag = () => {
  tempTag.value.visible = false
  const ad = appStore.data
  if (tempTag.value.dialogType === DIALOG_TYPE_ADD) {
    ad.userData.tags.push({
      title: tempTag.value.text,
      icon: tempTag.value.icon,
      sign: genFileName(),
      ctimeUtc: new Date(),
      mtimeUtc: new Date()
    })
  } else if (tempTag.value.dialogType === DIALOG_TYPE_EDIT) {
    for (const i of ad.userData.tags) {
      if (i.sign === tempTag.value.tagsSign) {
        i.icon = tempTag.value.icon
        i.title = tempTag.value.text
        i.mtimeUtc = new Date()
        break
      }
    }
  }

  appStore.setData(ad)
  resetTempTag()
}
const resetTempTag = () => {
  tempTag.value.text = ''
  tempTag.value.icon = ''
  tempTag.value.dialogType = DIALOG_TYPE_ADD
}
const onTagEmojiClick = (detail: EmojiClickEventDetail) => {
  tempTag.value.icon = detail.unicode || ''
}

const onOpenDialogTag = (detail: TagInfo) => {
  tempTag.value.dialogType = DIALOG_TYPE_EDIT
  tempTag.value.visible = true
  tempTag.value.icon = detail.icon
  tempTag.value.text = detail.title
  tempTag.value.tagsSign = detail.sign
}

const getDialogTitleAddEditTag = () => {
  return tempTag.value.dialogType === DIALOG_TYPE_EDIT ? t('Edit tag') : t('Add tag')
}

const onListTag = (tag: TagInfo) => {
  const items: NoteInfo[] = []
  // TODO: loop all the data, find the same tag

  appStore.setListColData({
    title: tag.title,
    icon: tag.icon,
    sign: tag.sign,
    tagsArr: [],
    type: TypeTag,
    listOfNote: items,
    listOfTag: []
  })

  appStore.data.navCol.sign = TypeTag

  restEditorCol()
}

const onDeleteTag = (detail: TagInfo) => {
  ElMessageBox.confirm(
    t('&delete tag comfirm tip', { name: detail.title }),
    t('Warning'),
    {
      confirmButtonText: t('OK'),
      cancelButtonText: t('Cancel'),
      type: 'warning'
    }
  )
    .then(() => {
      deleteTag(detail.sign)
    })
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    .catch(() => { })
}
// ---------- add / edit tag end ----------

// ---------- add / edit files ----------
const onListFiles = () => {
  // List of files will read data from appStore.data.userDataMap.files,
  // do not need real data, only set title.
  appStore.setListColData({
    title: t('File'),
    icon: '',
    sign: TypeFile,
    tagsArr: [],
    type: TypeFile,
    listOfNote: [],
    listOfTag: []
  })

  appStore.data.navCol.sign = TypeFile

  restEditorCol()
}
// ---------- add / edit files end ----------
</script>

<style lang="scss" scoped>
@import './common.scss';
@import './pane-navigation.scss';

#web-nav-btns {
  padding: 0.5rem;
  background: var(--enas-foreground-primary-color) !important;
  border-bottom: 1px solid var(--enas-border-color);
}
</style>

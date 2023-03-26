<template>
  <div class="navigation-column">
    <div id="web-nav-btns" v-if="isWebPage()">
      <SettingButton />
      <ThemeButton />
    </div>

    <div class="navigation-pane">
      <section class="section">

        <!-- Notebooks -->
        <div class="section-title-bar">
          <div class="section-title-bar-header">
            <div class="title text-sm">
              <span class="font-bold">{{ t('Notebook') }}</span>
            </div>
            <div class="right">
              <el-button :icon="Plus" size="small" color="var(--enas-border-color)" circle @click="visibleAddNb = true" />
            </div>
          </div>
        </div>

        <template v-if="panesStore.data.navigationCol.notebooks.length > 0">
          <div class="nb-name" v-for="(item, index) in panesStore.data.navigationCol.notebooks" v-bind:key="index">
            <div class="info">
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
        <div class="section-title-bar">
          <div class="section-title-bar-header">
            <div class="title text-sm">
              <span class="font-bold">{{ t('Tag') }}</span>
            </div>
            <div class="right">
              <el-button :icon="Plus" size="small" color="var(--enas-border-color)" circle
                @click="visibleAddEditTag = true" />
            </div>
          </div>
        </div>
        <template v-if="panesStore.data.navigationCol.tags.length > 0">
          <div class="tags">
            <template v-for="(item, index) in panesStore.data.navigationCol.tags" v-bind:key="index">
              <el-popover placement="left-start" trigger="click">
                <template #reference>
                  <span class="tag-btn m-2">
                    <label class="icon">{{ item.icon }} </label>
                    <span>{{ item.title }}</span>
                  </span>
                </template>

                <div class="enas-list cur-ptr">
                  <div class="list-item" @click="onOpenDialogTag(item)"> {{ t('Edit') }} </div>
                  <div class="list-item" @click="onListTag(item)"> {{ t('Show list') }} </div>
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
      <div class="disp-flex" @click="onListFiles">
        <span class="font-bold">{{ t('File manager') }}</span>
        <div class="disp-flex flex-grow justify-content-right">
          <el-icon>
            <ArrowRight />
          </el-icon>
        </div>
      </div>
    </div>

    <slot name="default"></slot>

    <el-dialog v-model="visibleAddNb" :title="getDialogTitleAddEditNb()" @closed="resetTempNb">
      <el-input v-model="tempNbTitle" />

      <div class="py-2">
        <SelectEmojiButton :icon="tempNbIcon" @onClick="onNbEmojiClick"></SelectEmojiButton>
        <SelectTagButton :tagExist="tempNbTagExist" :useIcon="false" @onClick="onNewNbAddTag"> </SelectTagButton>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="visibleAddNb = false">{{ t('Cancel') }}</el-button>
          <el-button type="primary" @click="onDialogCloseNb">
            {{ t('Confirm') }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="visibleAddEditTag" :title="getDialogTitleAddEditTag()" @closed="resetTempTag">
      <el-input v-model="tempTagText" />

      <div class="py-2">
        <SelectEmojiButton :icon="tempTagIcon" @onClick="onTagEmojiClick"></SelectEmojiButton>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="visibleAddEditTag = false">{{ t('Cancel') }}</el-button>
          <el-button type="primary" @click="onDialogCloseTag">
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
import SettingButton from '@/components/button/Setting.vue'
import ThemeButton from '@/components/button/Theme.vue'

import { TypeFile, TypeNote, TypeTag, StrSignOk } from '@/constants'
import { useAppStore } from '@/pinia/modules/app'
import { usePanesStore } from '@/pinia/modules/panes'
import { CmdAdapter } from '@/libs/commands'
import { saveCurrentNotebookAndCreateNotebookFile, deleteNotebook, deleteTag, readNotebookdata } from '@/libs/user_data/utils'
import { NoteInfo, NotebookInfo, TagInfo } from '@/libs/user_data/types'
import { genFileName, restEditorCol } from '@/utils/pinia_related'

const { t } = useI18n()
const appStore = useAppStore()
const panesStore = usePanesStore()

const isWebPage = () => {
  return appStore.data.isWebPage
}

const DIALOG_TYPE_ADD = 'ADD'
const DIALOG_TYPE_EDIT = 'EDIT'

// ---------- add / edit notebook ----------
const dialogTypeAddEditNb = ref(DIALOG_TYPE_ADD)
const visibleAddNb = ref(false)
const tempNbHashedSign = ref('')
const tempNbIcon = ref('')
const tempNbTitle = ref('')
const tempNbTagHashedSign = ref<string[]>([])

const onDialogCloseNb = async () => {
  visibleAddNb.value = false
  const pd = panesStore.data

  if (dialogTypeAddEditNb.value === DIALOG_TYPE_ADD) {
    const sign = genFileName()
    pd.navigationCol.notebooks.push({
      title: tempNbTitle.value,
      icon: tempNbIcon.value,
      sign,
      ctimeUtc: new Date(),
      mtimeUtc: new Date(),
      tagsArr: tempNbTagHashedSign.value
    })

    resetTempNb()
    // Save new notebook data file at first, then open it.
    if (await saveCurrentNotebookAndCreateNotebookFile(sign) === StrSignOk) {
      onListNb(pd.navigationCol.notebooks.length - 1)
    }
  } else if (dialogTypeAddEditNb.value === DIALOG_TYPE_EDIT) {
    for (const i of pd.navigationCol.notebooks) {
      if (i.sign === tempNbHashedSign.value) {
        i.icon = tempNbIcon.value
        i.title = tempNbTitle.value
        i.mtimeUtc = new Date()
        // i.tagsArr = tempNbTagHashedSign.value // It has been directly modified when operating the tag
        break
      }
    }

    panesStore.setData(pd)
  }
}

const resetTempNb = () => {
  tempNbTitle.value = ''
  tempNbIcon.value = ''
  dialogTypeAddEditNb.value = DIALOG_TYPE_ADD
}

const onNbEmojiClick = (detail: EmojiClickEventDetail) => {
  tempNbIcon.value = detail.unicode || ''
}

const onOpenDialogNb = (detail: NotebookInfo) => {
  dialogTypeAddEditNb.value = DIALOG_TYPE_EDIT
  visibleAddNb.value = true
  tempNbTitle.value = detail.title
  tempNbIcon.value = detail.icon
  tempNbHashedSign.value = detail.sign
}

const onNewNbAddTag = (detail: TagInfo) => {
  const sign = detail.sign
  if (dialogTypeAddEditNb.value === DIALOG_TYPE_ADD) {
    const arr = tempNbTagHashedSign.value
    const index = arr.indexOf(sign)

    if (index >= 0) { // If exist delete it
      arr.splice(index, 1)
      tempNbTagHashedSign.value = arr
    } else {
      tempNbTagHashedSign.value.push(sign)
    }
  } else if (dialogTypeAddEditNb.value === DIALOG_TYPE_EDIT) {
    const pd = panesStore.data
    // const notebooks = paneData.navigationCol.notebooks
    for (let index = 0; index < pd.navigationCol.notebooks.length; index++) {
      const nb = pd.navigationCol.notebooks[index]
      if (nb.sign === tempNbHashedSign.value) {
        const arr = nb.tagsArr
        const ih = arr.indexOf(sign)

        if (ih >= 0) { // If exist delete it
          arr.splice(ih, 1)
        } else {
          arr.push(sign)
        }
        pd.navigationCol.notebooks[index].tagsArr = arr
      }
    }
    panesStore.setData(pd)
  }
}

const getDialogTitleAddEditNb = () => {
  return dialogTypeAddEditNb.value === DIALOG_TYPE_EDIT ? t('Edit notebook') : t('Add notebook')
}

const tempNbTagExist = (sign: string) => {
  for (const nb of panesStore.data.navigationCol.notebooks) {
    if (nb.sign === tempNbHashedSign.value && nb.tagsArr.indexOf(sign) >= 0) {
      return true
    }
  }
  return false
}

const onListNb = (index: number) => {
  const nb = panesStore.data.navigationCol.notebooks[index]
  readNotebookdata(nb.sign).then((notes) => {
    panesStore.setListColData({
      title: nb.title,
      icon: nb.icon,
      sign: nb.sign,
      tagsArr: nb.tagsArr,
      type: TypeNote,
      list: notes
    })
    // TODO: save the value of the editor

    panesStore.resetEditorColData()
    restEditorCol()
  }).catch((err: Error) => {
    const typeName = t('Notebook')
    CmdAdapter.notification(t('&Error initializing file', { name: typeName }), t(err.message), '')
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
const dialogTypeAddEditTag = ref(DIALOG_TYPE_ADD)
const visibleAddEditTag = ref(false)
const tempTagText = ref('')
const tempTagIcon = ref('')
const tempTagHashedSign = ref('')
const onDialogCloseTag = () => {
  visibleAddEditTag.value = false
  const pd = panesStore.data
  if (dialogTypeAddEditTag.value === DIALOG_TYPE_ADD) {
    pd.navigationCol.tags.push({
      title: tempTagText.value,
      icon: tempTagIcon.value,
      sign: genFileName(),
      ctimeUtc: new Date(),
      mtimeUtc: new Date()
    })
  } else if (dialogTypeAddEditTag.value === DIALOG_TYPE_EDIT) {
    for (const i of pd.navigationCol.tags) {
      if (i.sign === tempTagHashedSign.value) {
        i.icon = tempTagIcon.value
        i.title = tempTagText.value
        i.mtimeUtc = new Date()
        break
      }
    }
  }

  panesStore.setData(pd)
  resetTempTag()
}
const resetTempTag = () => {
  tempTagText.value = ''
  tempTagIcon.value = ''
  dialogTypeAddEditTag.value = DIALOG_TYPE_ADD
}
const onTagEmojiClick = (detail: EmojiClickEventDetail) => {
  tempTagIcon.value = detail.unicode || ''
}

const onOpenDialogTag = (detail: TagInfo) => {
  dialogTypeAddEditTag.value = DIALOG_TYPE_EDIT
  visibleAddEditTag.value = true
  tempTagIcon.value = detail.icon
  tempTagText.value = detail.title
  tempTagHashedSign.value = detail.sign
}

const getDialogTitleAddEditTag = () => {
  return dialogTypeAddEditTag.value === DIALOG_TYPE_EDIT ? t('Edit tag') : t('Add tag')
}

const onListTag = (tag: TagInfo) => {
  const items: NoteInfo[] = []
  // TODO: loop all the data, find the same tag

  panesStore.setListColData({
    title: tag.title,
    icon: tag.icon,
    sign: tag.sign,
    tagsArr: [],
    type: TypeTag,
    list: items
  })
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
  // List of files will read data from panesStore.data.navigationCol.files,
  // do not need real data, only set title.
  panesStore.setListColData({
    title: t('File'),
    icon: '',
    sign: '>>>file list<<<',
    tagsArr: [],
    type: TypeFile,
    list: []
  })

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

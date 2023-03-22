<template>
  <div class="navigation-column">
    <div id="web-nav-btns" v-if="isWebPage()">
      <SettingButton />
      <SyncButton />
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
              <el-button :icon="Plus" size="small" color="var(--enas-border-color)" circle
                @click="visibleAddNotebook = true" />
            </div>
          </div>
        </div>

        <template v-if="paneDataStore.data.navigationCol.notebooks.length > 0">
          <div class="nb-name" v-for="(item, index) in paneDataStore.data.navigationCol.notebooks" v-bind:key="index">
            <div class="info">
              <div class="icon" @click="onListNotebook(index)">
                {{ item.icon }}
              </div>
              <div class="title" @click="onListNotebook(index)">
                {{ item.title }}
              </div>
              <div class="action">
                <DeleteOutlined @click="onDeleteNotebook(item)" />
                <span>&nbsp;</span>
                <EditOutlined @click="onOpenDialogNorebook(item)" />
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
        <template v-if="paneDataStore.data.navigationCol.tags.length > 0">
          <div class="disp-inline-block ml-2 mb-2 tags" v-for="(item, index) in paneDataStore.data.navigationCol.tags"
            v-bind:key="index">
            <el-popover placement="left-start" trigger="click">
              <template #reference>
                <span class="tag-btn">
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
          </div>
        </template>
        <template v-else>
          <div class="empty py-2"> {{ t('&No content') }} </div>
        </template>
      </section>
    </div>

    <slot name="default"></slot>

    <el-dialog v-model="visibleAddNotebook" :title="getDialogTitleAddEditNotebook()" @closed="resetTempNotebook">
      <el-input v-model="tempNotebookTitle" />

      <div class="py-2">
        <XPopover refId="notebookIconBtnPop" placement="bottom-start" trigger="click" :propTitle="t('Icon')" :widthAuto="true">
          <template #reference>
            <el-button>{{ tempNotebookIcon ? `${tempNotebookIcon} ` : '' }}{{ t('Icon') }}</el-button>
          </template>

          <!-- TODO add "locale" and "pickerStyle" to VuemojiPicker -->
          <VuemojiPicker @emojiClick="onNotebookEmojiClick" :isDark="emojiPickerIsDark()" />
        </XPopover>

        <XPopover refId="notebookIconBtnPop" placement="bottom-start" trigger="click" :propTitle="t('Icon')" :widthAuto="true">
          <template #reference>
            <el-button>{{ t('Tag') }}</el-button>
          </template>

          <template v-if="paneDataStore.data.navigationCol.tags.length > 0">
            <div v-for="(item, index) in paneDataStore.data.navigationCol.tags" v-bind:key="index">
              <div class="py-2" @click="onNewNotebookAddTag(item)">
                <span :class="`${tempNotebookTagExist(item.hashedSign) ? 'font-bold' : ''}`">
                  {{ item.icon }}{{ item.title }}
                </span>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="empty py-12"> {{ t('&No content') }} </div>
          </template>
        </XPopover>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="visibleAddNotebook = false">{{ t('Cancel') }}</el-button>
          <el-button type="primary" @click="onDialogCloseNotebook">
            {{ t('Confirm') }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="visibleAddEditTag" :title="getDialogTitleAddEditTag()" @closed="resetTempTag">
      <el-input v-model="tempTagText" />

      <div class="py-2">
        <XPopover refId="tagIconBtnPop" placement="bottom-start" trigger="click" :propTitle="t('Icon')" :widthAuto="true">
          <template #reference>
            <el-button>{{ tempTagIcon ? `${tempTagIcon} ` : '' }}{{ t('Icon') }}</el-button>
          </template>

          <!-- TODO add "locale" and "pickerStyle" to VuemojiPicker -->
          <VuemojiPicker @emojiClick="onTagEmojiClick" :isDark="emojiPickerIsDark()" />
        </XPopover>
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
import { ElMessageBox, ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons-vue'
import { VuemojiPicker, EmojiClickEventDetail } from 'vuemoji-picker'
import { useI18n } from 'vue-i18n'

import XPopover from '@/components/UI_component/x_popover.vue'
import SyncButton from '@/components/button/Sync.vue'
import SettingButton from '@/components/button/Setting.vue'
import ThemeButton from '@/components/button/Theme.vue'

import { ListColListTypeNotebook, ListColListTypeTag, StrSignOk } from '@/constants'
import { useAppStore } from '@/pinia/modules/app'
import { usePaneDataStore } from '@/pinia/modules/pane_data'
import { CmdAdapter } from '@/libs/commands'
import { saveCurrentNotebookAndCreateNotebookFile, deleteNotebook, deleteTag, readNotebookdata } from '@/libs/user_data/utils'
import { getTimestampMilliseconds } from '@/utils/time'
import { getHasdedSign } from '@/utils/pinia_data_related'
import { Note, Notebook, Tag } from './types'

const { t } = useI18n()
const appStore = useAppStore()
const paneDataStore = usePaneDataStore()

const isWebPage = () => {
  return appStore.data.isWebPage
}

const DIALOG_TYPE_ADD = 'ADD'
const DIALOG_TYPE_EDIT = 'EDIT'

// ---------- add / edit notebook ----------
const dialogTypeAddEditNotebook = ref(DIALOG_TYPE_ADD)
const visibleAddNotebook = ref(false)
const tempNotebookHashedSign = ref('')
const tempNotebookIcon = ref('')
const tempNotebookTitle = ref('')
const tempNotebookTagHashedSign = ref<string[]>([])
const onDialogCloseNotebook = async () => {
  visibleAddNotebook.value = false
  const paneData = paneDataStore.data

  if (dialogTypeAddEditNotebook.value === DIALOG_TYPE_ADD) {
    const hashedSign = getHasdedSign()
    paneData.navigationCol.notebooks.push({
      title: tempNotebookTitle.value,
      icon: tempNotebookIcon.value,
      hashedSign,
      mtimeUtc: getTimestampMilliseconds(),
      tagsArr: tempNotebookTagHashedSign.value
    })

    resetTempNotebook()
    // Save new notebook data file at first, then open it.
    if (await saveCurrentNotebookAndCreateNotebookFile(hashedSign) === StrSignOk) {
      onListNotebook(paneData.navigationCol.notebooks.length - 1)
    }
  } else if (dialogTypeAddEditNotebook.value === DIALOG_TYPE_EDIT) {
    for (const i of paneData.navigationCol.notebooks) {
      if (i.hashedSign === tempNotebookHashedSign.value) {
        i.icon = tempNotebookIcon.value
        i.title = tempNotebookTitle.value
        i.mtimeUtc = getTimestampMilliseconds()
        i.tagsArr = tempNotebookTagHashedSign.value
        break
      }
    }

    paneDataStore.setData(paneData)
  }
}

const resetTempNotebook = () => {
  tempNotebookTitle.value = ''
  tempNotebookIcon.value = ''
  dialogTypeAddEditNotebook.value = DIALOG_TYPE_ADD
}

const onNotebookEmojiClick = (detail: EmojiClickEventDetail) => {
  tempNotebookIcon.value = detail.unicode || ''
}

const onOpenDialogNorebook = (detail: Notebook) => {
  dialogTypeAddEditNotebook.value = DIALOG_TYPE_EDIT
  visibleAddNotebook.value = true
  tempNotebookTitle.value = detail.title
  tempNotebookIcon.value = detail.icon
  tempNotebookHashedSign.value = detail.hashedSign
}

const onNewNotebookAddTag = (detail: Tag) => {
  const arr = tempNotebookTagHashedSign.value
  const index = arr.indexOf(detail.hashedSign)
  if (index >= 0) { // If exist delete it
    arr.splice(index, 1)
    tempNotebookTagHashedSign.value = arr
  } else {
    tempNotebookTagHashedSign.value.push(detail.hashedSign)
  }
}

const getDialogTitleAddEditNotebook = () => {
  return dialogTypeAddEditNotebook.value === DIALOG_TYPE_EDIT ? t('Edit notebook') : t('Add notebook')
}

const tempNotebookTagExist = (hashedSign: string) => {
  return tempNotebookTagHashedSign.value.indexOf(hashedSign) >= 0
}
// ========== add / edit notebook end ==========

// ---------- add / edit tag ----------
const dialogTypeAddEditTag = ref(DIALOG_TYPE_ADD)
const visibleAddEditTag = ref(false)
const tempTagText = ref('')
const tempTagIcon = ref('')
const tempTagHashedSign = ref('')
const onDialogCloseTag = () => {
  visibleAddEditTag.value = false
  const paneData = paneDataStore.data
  if (dialogTypeAddEditTag.value === DIALOG_TYPE_ADD) {
    paneData.navigationCol.tags.push({
      title: tempTagText.value,
      icon: tempTagIcon.value,
      hashedSign: getHasdedSign(),
      mtimeUtc: getTimestampMilliseconds()
    })
  } else if (dialogTypeAddEditTag.value === DIALOG_TYPE_EDIT) {
    for (const i of paneData.navigationCol.tags) {
      if (i.hashedSign === tempTagHashedSign.value) {
        i.icon = tempTagIcon.value
        i.title = tempTagText.value
        i.mtimeUtc = getTimestampMilliseconds()
        break
      }
    }
  }

  paneDataStore.setData(paneData)
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

const onOpenDialogTag = (detail: Tag) => {
  dialogTypeAddEditTag.value = DIALOG_TYPE_EDIT
  visibleAddEditTag.value = true
  tempTagIcon.value = detail.icon
  tempTagText.value = detail.title
  tempTagHashedSign.value = detail.hashedSign
}

const getDialogTitleAddEditTag = () => {
  return dialogTypeAddEditTag.value === DIALOG_TYPE_EDIT ? t('Edit tag') : t('Add tag')
}

const onListNotebook = (index: number) => {
  const nb = paneDataStore.data.navigationCol.notebooks[index]
  readNotebookdata(nb.hashedSign).then((notes) => {
    paneDataStore.setListColData({
      title: nb.title,
      icon: nb.icon,
      hashedSign: nb.hashedSign,
      tagsArr: nb.tagsArr,
      type: ListColListTypeNotebook,
      list: notes
    })
    // TODO: save the value of the editor

    paneDataStore.resetEditorColData()
  }).catch((err) => {
    const name = t('notebook')
    CmdAdapter.notification(t('Error initializing {name} file', { name }), t(err), '')
    return false
  })
}

const onListTag = (tag: Tag) => {
  const items: Note[] = []
  // TODO: loop all the data, find the same tag

  paneDataStore.setListColData({
    title: tag.title,
    icon: tag.icon,
    hashedSign: tag.hashedSign,
    tagsArr: [],
    type: ListColListTypeTag,
    list: items
  })
}

// ========== add / edit tag end ==========

// ---------- delete notebook / tag ----------
const onDeleteNotebook = (detail: Notebook) => {
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
      deleteNotebook(detail.hashedSign)
    })
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    .catch(() => { })
}

const onDeleteTag = (detail: Tag) => {
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
      deleteTag(detail.hashedSign)
    })
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    .catch(() => { })
}
// ========== delete notebook / tag end ==========

const emojiPickerIsDark = () => {
  return true
}
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

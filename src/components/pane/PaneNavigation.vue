<template>
  <div>
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

        <template v-if="paneDataStore.data.navigationColumn.notebooks.length > 0">
          <div class="tag" v-for="(item, index) in paneDataStore.data.navigationColumn.notebooks" v-bind:key="index">
            <div class="tag-info">
              <div class="tag-icon" @click="onListNotebookItems(index)">
                {{ item.icon }}
              </div>
              <div class="title" @click="onListNotebookItems(index)">
                {{ item.title }}
              </div>
              <div class="action" @click="onOpenDialogNorebook(item)">
                <EditOutlined />
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
        <template v-if="paneDataStore.data.navigationColumn.tags.length > 0">
          <div class="disp-inline-block ml-2 mb-2" v-for="(item, index) in paneDataStore.data.navigationColumn.tags"
            v-bind:key="index">
            <el-popover placement="left-start" trigger="click">
              <template #reference>
                <el-tag>{{ item.icon }}{{ item.title }}</el-tag>
              </template>

              <div class="enas-list cur-ptr">
                <div class="list-item" @click="onOpenDialogTag(item)"> {{ t('Edit') }} </div>
                <div class="list-item" @click="onListTagItems(item)"> {{ t('Show list') }} </div>
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
        <XPopover refId="themeBtnPop" placement="bottom-start" trigger="click" :propTitle="t('Icon')" :widthAuto="true">
          <template #reference>
            <el-button>{{ tempNotebookIcon ? `${tempNotebookIcon} ` : '' }}{{ t('Icon') }}</el-button>
          </template>

          <!-- TODO add "locale" and "pickerStyle" to VuemojiPicker -->
          <VuemojiPicker @emojiClick="onNotebookEmojiClick" :isDark="emojiPickerIsDark()" />
        </XPopover>

        <XPopover refId="themeBtnPop" placement="bottom-start" trigger="click" :propTitle="t('Icon')" :widthAuto="true">
          <template #reference>
            <el-button>{{ t('Tag') }}</el-button>
          </template>

          <template v-if="paneDataStore.data.navigationColumn.tags.length > 0">
            <div v-for="(item, index) in paneDataStore.data.navigationColumn.tags" v-bind:key="index">
              <div class="py-2" @click="onNewNotebookAddTag(item)">
                {{ item.icon }}{{ item.title }}
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
        <XPopover refId="themeBtnPop" placement="bottom-start" trigger="click" :propTitle="t('Icon')" :widthAuto="true">
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
import { Plus } from '@element-plus/icons-vue'
import { EditOutlined } from '@ant-design/icons-vue'
import { VuemojiPicker, EmojiClickEventDetail } from 'vuemoji-picker'
import { useI18n } from 'vue-i18n'

import { ItemsListTypeNotebook, ItemsListTypeTag, StrSignOk } from '@/constants'
import { CmdInvoke } from '@/libs/commands'
import { UserDataFile } from '@/libs/commands/types'
import { useAppStore } from '@/pinia/modules/app'
import { usePaneDataStore } from '@/pinia/modules/pane_data'
import { useSettingStore } from '@/pinia/modules/settings'
import { parseNotebook } from '@/libs/user_data/parser_decode'
import { saveUserDataAndCreateNotebookFile } from '@/libs/user_data/parser_encode'
import XPopover from '@/components/xPopover/popover.vue'
import SyncButton from '@/components/button/Sync.vue'
import SettingButton from '@/components/button/Setting.vue'
import ThemeButton from '@/components/button/Theme.vue'
import { getTimestampMilliseconds } from '@/utils/time'
import { getHasdedSign } from '@/utils/pinia_data_related'
import { colorIsDark } from '@/___professional___/utils/color'
import { Note, Notebook, Tag } from './types'

const { t } = useI18n()
const appStore = useAppStore()
const paneDataStore = usePaneDataStore()
const settingStore = useSettingStore()

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
    paneData.navigationColumn.notebooks.push({
      title: tempNotebookTitle.value,
      icon: tempNotebookIcon.value,
      hashedSign,
      mtimeUtc: getTimestampMilliseconds()
    })

    resetTempNotebook()
    // Save new notebook data file at first, then open it.
    if (await saveUserDataAndCreateNotebookFile(hashedSign) === StrSignOk) {
      onListNotebookItems(paneData.navigationColumn.notebooks.length - 1)
    }
  } else if (dialogTypeAddEditNotebook.value === DIALOG_TYPE_EDIT) {
    for (const i of paneData.navigationColumn.notebooks) {
      if (i.hashedSign === tempNotebookHashedSign.value) {
        i.icon = tempNotebookIcon.value
        i.title = tempNotebookTitle.value
        i.mtimeUtc = getTimestampMilliseconds()
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
  tempNotebookTagHashedSign.value.push(detail.hashedSign)
}
const getDialogTitleAddEditNotebook = () => {
  return dialogTypeAddEditNotebook.value === DIALOG_TYPE_EDIT ? t('Edit notebook') : t('Add notebook')
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
    paneData.navigationColumn.tags.push({
      title: tempTagText.value,
      icon: tempTagIcon.value,
      hashedSign: getHasdedSign(),
      mtimeUtc: getTimestampMilliseconds()
    })
  } else if (dialogTypeAddEditTag.value === DIALOG_TYPE_EDIT) {
    for (const i of paneData.navigationColumn.tags) {
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

const onListNotebookItems = (index: number) => {
  const nb = paneDataStore.data.navigationColumn.notebooks[index]
  const p = appStore.data.dataPath
  const filePath = p.pathOfCurrentDir + nb.hashedSign + settingStore.data.encryption.fileExt

  CmdInvoke.readUserDataFile(settingStore.data.encryption.masterPassword, filePath, true).then((data: UserDataFile) => {
    if (data.file_data_str.length === 0) {
      console.log('>>> onListNotebookItems readUserDataFile get empty content')
      //   ElMessage({
      //     message: t('Unable to read file contents') + filePath,
      //     type: 'error'
      //   })
    }

    const ret = parseNotebook(JSON.parse(data.file_data_str))// call JSON.parse to get a JSON string
    paneDataStore.setItemsColumnData({
      title: nb.title,
      icon: nb.icon,
      hashedSign: nb.hashedSign,
      type: ItemsListTypeNotebook,
      list: ret
    })
  })
}
const onListTagItems = (tag: Tag) => {
  const items: Note[] = []
  // TODO: loop all the data, find the same tag

  paneDataStore.setItemsColumnData({
    title: tag.title,
    icon: tag.icon,
    hashedSign: tag.hashedSign,
    type: ItemsListTypeTag,
    list: items
  })
}

// ========== add / edit tag end ==========

const emojiPickerIsDark = () => {
  const color = getComputedStyle(document.documentElement).getPropertyValue('--el-bg-color-overlay')
  return colorIsDark(color)
}
</script>

<style lang="scss" scoped>
@import './pane-navigation.scss';

#web-nav-btns {
  padding: 0.5rem;
  background: var(--enas-foreground-primary-color) !important;
  border-bottom: 1px solid var(--enas-border-color);
}

.empty {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
  box-sizing: border-box;
}
</style>

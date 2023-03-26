<template>
  <div>
    <div :class="`${className} section`">
      <div v-if="panesStore.data.listCol.sign === ''">
        <div class="empty py-2"> {{ t('&No content') }} </div>
      </div>
      <div v-else>

        <!-- title -->
        <div class="title-bar">
          <div class="title-bar-container">
            <div class="section-title-bar-header">
              <div class="box disp-flex">
                <div class="left lg:pt-0">
                  <div class="left-box">
                    <label class="icon text-lg ">
                      {{ panesStore.data.listCol.icon }}
                    </label>
                    <div class="title-box text-lg">
                      {{ panesStore.data.listCol.title }}
                    </div>
                  </div>
                </div>
                <div class="right">
                  <el-button-group>
                    <ListSortButton />
                    <AddDocButton v-if="panesStore.data.listCol.type === TypeNote" />
                  </el-button-group>
                </div>
              </div>
            </div>

            <!-- tags -->
            <template v-if="panesStore.data.listCol.tagsArr && panesStore.data.listCol.type !== TypeTag">
              <SmallTagList :tagsArr="panesStore.data.listCol.tagsArr"></SmallTagList>
            </template>
          </div>
        </div>

        <!-- content -->
        <template v-if="panesStore.data.listCol.list">
          <!-- for note list -->
          <template v-if="panesStore.data.listCol.type === TypeNote">
            <div class="content-list">
              <div v-for="(item, index) in panesStore.data.listCol.list" v-bind:key="index" @click="onClickNote(index)"
                class="content-list-item">
                <div :class="item.sign === panesStore.data.editorCol.sign ? 'selected p-2' : 'p-2'">
                  <div class="disp-flex">
                    <div class="left">
                      <el-icon class="item-icon" v-if="item.type === TypeNote">
                        <Tickets />
                      </el-icon>
                    </div>
                    <div class="main">
                      <div class="title">{{ item.title }}</div>
                    </div>
                    <div class="right"></div>
                  </div>

                  <div>
                    <div class="mb-1 text-sm opacity-50 text-xs">
                      <div v-if="settingStore.data.appearance.listColShowCreateTime">
                        {{ t('Created') }}:
                        <span class="fr">
                          {{ formatTime(item.ctimeUtc) }}
                        </span>
                      </div>
                      <div v-if="settingStore.data.appearance.listColShowUpdateTime">
                        {{ t('Updated') }}:
                        <span class="fr">
                          {{ formatTime(item.mtimeUtc) }}
                        </span>
                      </div>
                    </div>

                    <SmallTagList :tagsArr="item.tagsArr"></SmallTagList>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <!-- for tag list -->
          <template v-else-if="panesStore.data.listCol.type === TypeTag">
            <!-- TODO -->
            <!-- notebook -->
          </template>
          <!-- for file list -->
          <template v-else-if="panesStore.data.listCol.type === TypeFile">
            <AddFileButton></AddFileButton>
            <div class="content-list">
              <div v-for="(item, index) in panesStore.data.navigationCol.files" v-bind:key="index"
                @click="onClickFile(index)" class="content-list-item">
                <div :class="item.sign === panesStore.data.editorCol.sign ? 'selected p-2' : 'p-2'">
                  <div class="disp-flex">
                    <div class="left">
                      <el-icon class="item-icon">
                        <Tickets />
                      </el-icon>
                    </div>
                    <div class="main">
                      <div class="title">{{ item.title }}</div>
                    </div>
                    <div class="right"></div>
                  </div>
                  <div>
                    <SmallTagList :tagsArr="item.tagsArr"></SmallTagList>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </template>
        <template v-else>
          <div class="empty py-12"> </div>
        </template>
      </div>
      <slot name="default"></slot>

    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Tickets } from '@element-plus/icons-vue'

import AddDocButton from '@/components/button/AddDoc.vue'
import AddFileButton from '@/components/button/AddFile.vue'
import ListSortButton from '@/components/button/ListSort.vue'
import SmallTagList from '@/components/widget/SmallTagList.vue'

import { TypeFile, TypeTag, TypeNote } from '@/constants'
import { useAppStore } from '@/pinia/modules/app'
import { useSettingStore } from '@/pinia/modules/settings'
import { usePanesStore } from '@/pinia/modules/panes'
import { NoteInfo, FileInfo } from '@/libs/user_data/types'
import { formatTime } from '@/utils/pinia_related'

const props = defineProps({
  className: {
    type: String,
    required: true
  }
})

const { t } = useI18n()
const appStore = useAppStore()
const settingStore = useSettingStore()
const panesStore = usePanesStore()

const listSort = (a: NoteInfo | FileInfo, b: NoteInfo | FileInfo) => {
  const sortBy = settingStore.data.appearance.listColSortBy
  const sortOrder = settingStore.data.appearance.listColSortOrder

  if (Object.prototype.hasOwnProperty.call(a, sortBy)) {
    let valueA: string | Date
    let valueB: string | Date
    switch (sortBy) {
      case 'title':
        valueA = a.title.toUpperCase()
        valueB = b.title.toUpperCase()
        break
      case 'mtimeUtc':
        valueA = a.mtimeUtc
        valueB = b.mtimeUtc
        break
      case 'ctimeUtc':
        valueA = a.ctimeUtc
        valueB = b.ctimeUtc
        break
      default:
        return 0
    }

    if (valueA < valueB) {
      return sortOrder === 'DESC' ? 1 : -1
    }
    if (valueA > valueB) {
      return sortOrder === 'DESC' ? -1 : 1
    }
  } else {
    console.log('>>> Cannot use sort field ::', sortBy)
  }

  return 0
}

const list = ref(panesStore.data.listCol.list)

settingStore.$subscribe((mutation, state) => {
  list.value = list.value.sort(listSort)
})

panesStore.$subscribe((mutation, state) => {
  list.value = state.data.listCol.list.sort(listSort)
})

// -------- note --------
const onClickNote = (index: number) => {
  const note = panesStore.data.listCol.list[index]
  const editorData = panesStore.data.editorCol
  editorData.content = note.content
  editorData.title = note.title
  editorData.sign = note.sign
  editorData.tagsArr = note.tagsArr
  editorData.type = note.type
  panesStore.setEditorColData(editorData)

  const ast = appStore.data
  ast.currentFile.name = note.title
  ast.currentFile.sign = note.sign
  ast.currentFile.indexInList = index
  ast.currentFile.type = note.type
  appStore.setData(ast)
}
// -------- note end --------

// -------- file --------
const onClickFile = (index: number) => {
  const file = panesStore.data.navigationCol.files[index]

  const ed = panesStore.data.editorCol
  ed.content = file.content
  ed.title = file.title
  ed.sign = file.sign
  ed.tagsArr = file.tagsArr
  ed.type = TypeFile
  panesStore.setEditorColData(ed)

  const ad = appStore.data
  ad.currentFile.name = file.title
  ad.currentFile.sign = file.sign
  ad.currentFile.indexInList = index
  ad.currentFile.type = TypeFile
  appStore.setData(ad)
}
// -------- file end --------

</script>

<style lang="scss" scoped>
@import './common.scss';
@import './pane-list.scss';
</style>

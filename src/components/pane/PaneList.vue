<template>
  <div>
    <div :class="`${className} section`">
      <div v-if="appStore.data.listCol.sign === ''">
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
                      {{ appStore.data.listCol.icon }}
                    </label>
                    <div class="title-box text-lg">
                      {{ appStore.data.listCol.title }}
                    </div>
                  </div>
                </div>
                <div class="right">
                  <ListSortButton />
                  <ListAddButton />
                </div>
              </div>
            </div>

            <!-- tags -->
            <template v-if="appStore.data.listCol.tagsArr && appStore.data.listCol.type !== TypeTag">
              <SmallTagList :tagsArr="appStore.data.listCol.tagsArr"></SmallTagList>
            </template>
          </div>
        </div>

        <!-- content -->
        <template v-if="appStore.data.listCol.listOfNote">
          <!-- for note list -->
          <template v-if="appStore.data.listCol.type === TypeNote">
            <div class="content-list">
              <div v-for="(item, index) in appStore.data.listCol.listOfNote" v-bind:key="index" @click="onClickNote(item)"
                class="content-list-item">
                <div :class="item.sign === appStore.data.currentFile.subSign ? 'item-selected p-2' : 'p-2'">
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
                      <div v-if="appStore.data.settings.appearance.listColShowCreateTime">
                        {{ t('Created') }}:
                        <span class="fr">
                          {{ formatTime(item.ctimeUtc) }}
                        </span>
                      </div>
                      <div v-if="appStore.data.settings.appearance.listColShowUpdateTime">
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
          <template v-else-if="appStore.data.listCol.type === TypeTag">
            <!-- TODO -->
            <!-- loop listOfTag.listOfTag -->
          </template>

          <!-- for files list -->
          <template v-else-if="appStore.data.listCol.type === TypeFile">
            <ListShareButton></ListShareButton>
            <div class="content-list">
              <div v-for="(item, index) in appStore.data.userData.files" v-bind:key="index" @click="onClickFile(index)"
                class="content-list-item">
                <div :class="item.sign === appStore.data.currentFile.subSign ? 'item-selected p-2' : 'p-2'">
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
import { Tickets, Grid } from '@element-plus/icons-vue'

import ListAddButton from '@/components/button/ListAdd.vue'
import ListShareButton from '@/components/button/ListShareFile.vue'
import ListSortButton from '@/components/button/ListSort.vue'
import SmallTagList from '@/components/widget/SmallTagList.vue'

import { TypeFile, TypeTag, TypeNote } from '@/constants'
import { useAppStore } from '@/pinia/modules/app'
import { NoteInfo, FileInfo } from '@/libs/user_data/types'
import { formatTime } from '@/utils/pinia_related'

import { CurrentFileInfo } from './types'
import { getCurrentNotebookInList } from '@/libs/user_data/utils'

const props = defineProps({
  className: {
    type: String,
    required: true
  }
})

const { t } = useI18n()
const appStore = useAppStore()

const listSort = (a: NoteInfo | FileInfo, b: NoteInfo | FileInfo) => {
  const sortBy = appStore.data.settings.appearance.listColSortBy
  const sortOrder = appStore.data.settings.appearance.listColSortOrder

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

const list = ref(appStore.data.listCol.listOfNote)
appStore.$subscribe((mutation, state) => {
  list.value = list.value.sort(listSort)
  list.value = state.data.listCol.listOfNote.sort(listSort)
})

// -------- note --------
const onClickNote = (note: NoteInfo) => {
  const ad = appStore.data
  const currentFile: CurrentFileInfo = {
    content: note.content,
    subSign: note.sign,
    tagsArr: note.tagsArr,
    title: note.title,
    type: TypeNote,
    sign: ad.currentFile.sign
  }

  ad.currentFile = currentFile
  appStore.setData(ad)
}
// -------- note end --------

// -------- file --------
const onClickFile = (index: number) => {
  const file = appStore.data.userData.files[index]

  const ad = appStore.data
  const currentFile: CurrentFileInfo = {
    content: file.content,
    title: file.title,
    sign: file.sign,
    tagsArr: file.tagsArr,
    type: TypeFile,
    subSign: file.sign
  }

  ad.currentFile = currentFile
  appStore.setData(ad)
}
// -------- file end --------

</script>

<style lang="scss" scoped>
@import './common.scss';
@import './pane-list.scss';
</style>

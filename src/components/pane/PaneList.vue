<template>
  <div>
    <div :class="`${className} section`">
      <div v-if="paneDataStore.data.listCol.hashedSign === ''">
        <div class="empty py-2"> {{ t('&No content') }} </div>
      </div>
      <div v-else>

        <!-- title -->
        <div class="title-bar">
          <div class="title-bar-container">
            <div class="section-title-bar-header">
              <div class="box flex">
                <div class="left lg:pt-0">
                  <div class="left-box">
                    <label class="icon text-lg ">
                      {{ paneDataStore.data.listCol.icon }}
                    </label>
                    <div class="title-box text-lg">
                      {{ paneDataStore.data.listCol.title }}
                    </div>
                  </div>
                </div>
                <div class="right">
                  <el-button-group>
                    <ListSortButton />
                    <ListAddButton />
                  </el-button-group>
                </div>
              </div>
            </div>
            <!-- tags -->
            <div class="tags text-xs"
              v-if="paneDataStore.data.listCol.tagsArr && paneDataStore.data.listCol.tagsArr.length > 0">
              <template v-for="(ii, index) in paneDataStore.data.listCol.tagsArr" v-bind:key="index">
                <!-- TODO Not elegant enough -->
                <span class="tag-btn" v-if="getTagData(ii).title">
                  <label class="icon">{{ getTagData(ii).icon }} </label>
                  <span>{{ getTagData(ii).title }}</span>
                </span>
              </template>
            </div>
          </div>
        </div>

        <!-- content -->
        <template v-if="paneDataStore.data.listCol.type === ListColListTypeNotebook && paneDataStore.data.listCol.list">
          <div class="content-list">
            <div class="content-list-item" v-for="(item, index) in list" v-bind:key="index"
              @click="onChangeItem(index)">
              <div :class="item.hashedSign === paneDataStore.data.editorCol.hashedSign ? 'selected p-2' : 'p-2'">
                <div class="flex">
                  <div class="left">
                    <el-icon class="item-icon" v-if="item.type === DocTypeNote">
                      <Tickets />
                    </el-icon>
                    <el-icon class="item-icon" v-if="item.type === DocTypeSheet">
                      <Grid />
                    </el-icon>
                  </div>
                  <div class="main">
                    <div class="title">{{ item.title }}</div>
                  </div>
                  <div class="right"></div>
                </div>

                <div>
                  <div class="mt-1 text-sm opacity-50 text-xs">
                    <div v-if="settingStore.data.appearance.listColShowCreateTime">
                      {{ t('Created') }}:
                      <span class="fr">
                        {{ formatDateTime(item.createTime, settingStore.data.appearance.dateTimeFormat) }}
                      </span>
                    </div>
                    <div v-if="settingStore.data.appearance.listColShowUpdateTime">
                      {{ t('Updated') }}:
                      <span class="fr">
                        {{ formatDateTime(item.updateTime, settingStore.data.appearance.dateTimeFormat) }}
                      </span>
                    </div>
                  </div>

                  <div class="tags text-xs" v-if="item.tagsArr.length > 0">
                    <template v-for="(ii, index) in item.tagsArr" v-bind:key="index">
                      <!-- TODO Not elegant enough -->
                      <span class="tag-btn" v-if="getTagData(ii).title">
                        <label class="icon">{{ getTagData(ii).icon }} </label>
                        <span>{{ getTagData(ii).title }}</span>
                      </span>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
        <template v-if="paneDataStore.data.listCol.type === ListColListTypeTag && paneDataStore.data.listCol.list">
          <CollectionTag />
          <!-- notebook -->
          <!-- note -->
          <!-- attachment -->
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
import { CollectionTag, Tickets, Grid } from '@element-plus/icons-vue'

import { ListColListTypeNotebook, ListColListTypeTag, DocTypeNote } from '@/constants'
import { useAppStore } from '@/pinia/modules/app'
import { useSettingStore } from '@/pinia/modules/settings'
import { usePaneDataStore } from '@/pinia/modules/pane_data'
import ListSortButton from '@/components/button/ListSort.vue'
import ListAddButton from '@/components/button/ListAdd.vue'
import { formatDateTime } from '@/utils/string'
import { Tag, Note } from './types'

const props = defineProps({
  className: {
    type: String,
    required: true
  }
})

const { t } = useI18n()
const appStore = useAppStore()
const settingStore = useSettingStore()
const paneDataStore = usePaneDataStore()

const getTagData = (hashedSign: string): Tag => {
  let res = {
    title: '',
    icon: '',
    hashedSign,
    mtimeUtc: 0
  }
  const tagsArr = paneDataStore.data.navigationCol.tags
  if (tagsArr) {
    for (const i of tagsArr) {
      if (i.hashedSign === hashedSign) {
        res = i
        break
      }
    }
  }

  return res
}

const onChangeItem = (index: number) => {
  const note = paneDataStore.data.listCol.list[index]
  const editorData = paneDataStore.data.editorCol
  editorData.content = note.content
  editorData.title = note.title
  editorData.type = note.type
  editorData.hashedSign = note.hashedSign
  paneDataStore.setEditorColData(editorData)

  const ast = appStore.data
  ast.currentFile.name = note.title
  ast.currentFile.hashedSign = note.hashedSign
  ast.currentFile.indexInList = index
  ast.currentFile.type = note.type
  appStore.setData(ast)
}

const listSort = (a: Note, b: Note) => {
  const sortBy = settingStore.data.appearance.listColSortBy
  const sortOrder = settingStore.data.appearance.listColSortOrder
  if (Object.prototype.hasOwnProperty.call(a, sortBy)) {
    let nameA: string | Date
    let nameB: string | Date

    switch (sortBy) {
      case 'title':
        nameA = a.title.toUpperCase()
        nameB = b.title.toUpperCase()
        break
      case 'updateTime':
        nameA = a.updateTime
        nameB = b.updateTime
        break
      case 'createTime':
        nameA = a.createTime
        nameB = b.createTime
        break
      default:
        return 0
    }

    if (nameA < nameB) {
      return sortOrder === 'DESC' ? 1 : -1
    }
    if (nameA > nameB) {
      return sortOrder === 'DESC' ? -1 : 1
    }
  }

  return 0
}

const list = ref(paneDataStore.data.listCol.list)

settingStore.$subscribe((mutation, state) => {
  list.value = list.value.sort(listSort)
})

paneDataStore.$subscribe((mutation, state) => {
  list.value = state.data.listCol.list.sort(listSort)
})
</script>

<style lang="scss" scoped>
@import './common.scss';
@import './pane-list.scss';
</style>

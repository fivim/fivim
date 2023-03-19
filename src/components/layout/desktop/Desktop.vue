<template>
  <!-- desktop title bar -->
  <DesktopTitleBar :showExtButtons="true" v-if="isDesktopMode() && !isMobileMode()">
    <template #titleName>
      {{ appStore.data.currentFile.name ? appStore.data.currentFile.name + " - " + AppName : AppName }}
    </template>
  </DesktopTitleBar>

  <!-- main -->
  <div :class="`app-main ${isDesktopMode() ? 'windows-desktop' : ''}`">
    <!-- full screen editor -->
    <!-- <div v-if="appStore.data.editorFullScreen" id="app" class="app">
      <EditorFullScreen />
    </div> -->

    <!-- desktop panes -->
    <div id="app" :class="`app ${isDesktopMode() ? 'disp-grid' : ''}`" :style="{ ...computeStylesForContainer() }">
      <template v-for="(item, index) in paneController.panesNameArr" v-bind:key="index">
        <!-- navigation -->
        <PaneNavigation ref="navigationRef" v-if="(item === PaneIds.NavigationCol)"
          :className="classNames(computePaneClasses(false), item)">

          <template #default>
            <LazyPaneResizer v-if="isDesktopMode()" :collapsable="true" :defaultWidth="PaneWidthNavigation" :left="0"
              :minWidth="PANE_NAVIGATION_MIN_WIDTH" :modifyElementWidth="false" :side="PaneSide.Right"
              :type="PaneResizeType.WidthOnly" :width="PaneWidthNavigation" :pane="navigationRef"
              @onWidthChange="onWidthChangeNavigationPane" />
          </template>
        </PaneNavigation>

        <!-- list -->
        <PaneList ref="listRef" v-if="(item === PaneIds.ListCol)"
          :className="classNames(computePaneClasses(false), item)">

          <template #default>
            <LazyPaneResizer v-if="isDesktopMode()" :collapsable="true" :defaultWidth="PaneWidthList" :left="0"
              :minWidth="PANE_LIST_MIN_WIDTH" :modifyElementWidth="false" :side="PaneSide.Right"
              :type="PaneResizeType.WidthOnly" :width="PaneWidthList" :pane="listRef"
              @onWidthChange="onWidthChangeListPane" />
          </template>
        </PaneList>

        <!-- editor -->
        <PaneEditor ref="editorContentRef" v-if="(item === PaneIds.EditorCol)"
          :className="classNames(computePaneClasses(true), item)">

        </PaneEditor>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue'

import DesktopTitleBar from '@/components/layout/desktop/titleBar/DesktopTitleBar.vue'
import type { PaneController } from '@/components/pane/types'
import { PaneIds, PaneSide, PaneResizeType } from '@/components/pane/types'
import PaneNavigation from '@/components/pane/PaneNavigation.vue'
import PaneList from '@/components/pane/PaneList.vue'
import PaneEditor from '@/components/pane/PaneEditor.vue'
// import EditorFullScreen from '@/___professional___/components/pane/EditorMilkdownFullScreen.vue'

import { AppMode } from '@/types'
import { AppName } from '@/constants'
import { isTabletScreen } from '@/utils/media_query'
import { classNames } from '@/utils/string'
import { useAppStore } from '@/pinia/modules/app'

const appStore = useAppStore()

// ---------- panes ----------
const paneController: PaneController = {
  panesNameArr: [PaneIds.NavigationCol, PaneIds.ListCol, PaneIds.EditorCol],
  focusModeEnabled: false
}

const PANE_NAVIGATION_MIN_WIDTH = 100
const PANE_LIST_MIN_WIDTH = 220
const PaneWidthNavigation = ref(200)
const PaneWidthList = ref(PANE_LIST_MIN_WIDTH)

const isDesktopMode = () => {
  return appStore.data.appMode === AppMode.Desktop
}
const isMobileMode = () => {
  return appStore.data.isWebPage
}

const computeStylesForContainer = () => {
  const panesNameArr = paneController.panesNameArr
  const panesNameCount = panesNameArr.length

  if (!isDesktopMode) {
    return {}
  }

  switch (panesNameCount) {
    case 1: {
      return {
        gridTemplateColumns: 'auto'
      }
    }
    case 2: {
      if (paneController.focusModeEnabled) {
        return {
          gridTemplateColumns: '0 1fr'
        }
      }
      if (isTabletScreen()) {
        return {
          gridTemplateColumns: '1fr 2fr'
        }
      } else {
        if (panesNameArr[0] === PaneIds.NavigationCol) {
          return {
            gridTemplateColumns: `${PaneWidthNavigation.value}px auto`
          }
        } else {
          return {
            gridTemplateColumns: `${PaneWidthList.value}px auto`
          }
        }
      }
    }
    case 3: {
      if (paneController.focusModeEnabled) {
        return {
          gridTemplateColumns: '0 0 1fr'
        }
      }
      return {
        gridTemplateColumns: `${PaneWidthNavigation.value}px ${PaneWidthList.value}px 2fr`
      }
    }
    default:
      return {}
  }
}

const computePaneClasses = (isPendingEntrance: boolean): string => {
  const common = isDesktopMode() ? 'w-full' : ''
  if (!isDesktopMode) {
    return `pos-abs top-0 left-0 w-full ${common} ${isPendingEntrance ? 'translate-x-100%' : 'translate-x-0 '}`
  } else {
    return `pos-rel overflow-hidden ${common}`
  }
}
// ========== panes end ==========

// ---------- resizer ----------
const navigationRef = ref()
const listRef = ref()
const editorContentRef = ref()

const LazyPaneResizer = defineAsyncComponent({
  loader: () => import('@/components/pane/Resizer.vue')
})

const onWidthChangeNavigationPane = (width: number) => {
  PaneWidthNavigation.value = width
}

const onWidthChangeListPane = (width: number) => {
  PaneWidthList.value = width
}
// ========== resizer end ==========

</script>

<style lang="scss"></style>

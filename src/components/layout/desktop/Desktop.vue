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
        <PaneNavigation ref="navigationRef" v-if="(item === PaneIds.NavigationColumn)"
          :className="classNames(computePaneClasses(false), item)">

          <template #default>
            <LazyPaneResizer v-if="isDesktopMode()" :collapsable="true" :defaultWidth="PaneWidthNavigation" :left="0"
              :minWidth="PANE_NAVIGATION_MIN_WIDTH" :modifyElementWidth="false" :side="PaneSide.Right"
              :type="PaneResizeType.WidthOnly" :width="PaneWidthNavigation" :pane="navigationRef"
              @onWidthChange="onWidthChangeNavigationPane" />
          </template>
        </PaneNavigation>

        <!-- items -->
        <PaneItems ref="itemsRef" v-if="(item === PaneIds.ItemsColumn)"
          :className="classNames(computePaneClasses(false), item)">

          <template #default>
            <LazyPaneResizer v-if="isDesktopMode()" :collapsable="true" :defaultWidth="PaneWidthItems" :left="0"
              :minWidth="PANE_ITEMS_MIN_WIDTH" :modifyElementWidth="false" :side="PaneSide.Right"
              :type="PaneResizeType.WidthOnly" :width="PaneWidthItems" :pane="itemsRef"
              @onWidthChange="onWidthChangeItemsPane" />
          </template>
        </PaneItems>

        <!-- editor -->
        <PaneEditor ref="editorContentRef" v-if="(item === PaneIds.EditorColumn)"
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
import PaneItems from '@/components/pane/PaneItems.vue'
import PaneEditor from '@/components/pane/PaneEditor.vue'

import { AppMode } from '@/types'
import { AppName } from '@/constants'
import { isTabletScreen } from '@/utils/media_query'
import { classNames } from '@/utils/string'
import { useAppStore } from '@/pinia/modules/app'

const appStore = useAppStore()

// ---------- panes ----------
const paneController: PaneController = {
  panesNameArr: [PaneIds.NavigationColumn, PaneIds.ItemsColumn, PaneIds.EditorColumn],
  focusModeEnabled: false
}

const PANE_NAVIGATION_MIN_WIDTH = 100
const PANE_ITEMS_MIN_WIDTH = 220
const PaneWidthNavigation = ref(200)
const PaneWidthItems = ref(PANE_ITEMS_MIN_WIDTH)

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
        if (panesNameArr[0] === PaneIds.NavigationColumn) {
          return {
            gridTemplateColumns: `${PaneWidthNavigation.value}px auto`
          }
        } else {
          return {
            gridTemplateColumns: `${PaneWidthItems.value}px auto`
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
        gridTemplateColumns: `${PaneWidthNavigation.value}px ${PaneWidthItems.value}px 2fr`
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
const itemsRef = ref()
const editorContentRef = ref()

const LazyPaneResizer = defineAsyncComponent({
  loader: () => import('@/components/pane/Resizer.vue')
})

const onWidthChangeNavigationPane = (width: number) => {
  PaneWidthNavigation.value = width
}

const onWidthChangeItemsPane = (width: number) => {
  PaneWidthItems.value = width
}
// ========== resizer end ==========

</script>

<style lang="scss"></style>

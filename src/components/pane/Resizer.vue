<!--
PaneResizer should use LazyPaneResizer, or the ref of pane may have problem.
const LazyPaneResizer = defineAsyncComponent({
  loader: () => import('@/components/pane/Resizer.vue'),
})
-->

<template>
  <div :class="classNames('pane-resizer', props.side === PaneSide.Left && 'left-0 right-auto',)" @mousedown="onMouseDown"
    ref="resizerElementRef" />
</template>

<script setup lang="ts">
import { ref, toRefs, onMounted, onBeforeUnmount, onUpdated } from 'vue'
import type { PropType } from 'vue'

import { PaneSide, PaneResizeType } from './types'
import { debounce } from '@/utils/utils'
import { classNames } from '@/utils/string'

const props = defineProps({
  width: {
    type: Number,
    required: true
  },
  left: {
    type: Number,
    required: true
  },
  collapsable: {
    type: Boolean,
    default: false
  },
  defaultWidth: {
    type: Number,
    default: 0
  },
  minWidth: {
    type: Number,
    default: 0
  },
  pane: {
    type: Object,
    required: true
  },
  side: {
    type: String as PropType<PaneSide>,
    required: true
  },
  type: {
    type: String as PropType<PaneResizeType>,
    required: true
  },
  modifyElementWidth: {
    type: Boolean,
    required: true
  }
})

// For better code hints. Refer: https://juejin.cn/post/7012814138145505287
interface emitType {
  (e: 'onWidthChange', value: number): void
}

const emit = defineEmits<emitType>()

type State = {
  collapsed: boolean
  pressed: boolean
}

const eleIds = {
  app: 'app',
  overlay: 'resizer-overlay'
}

// ---------- init ----------
const overlay = ref<HTMLDivElement>()
const resizerElementRef = ref<HTMLDivElement>()
let debouncedResizeHandler: () => void
let lastDownX = 0
let lastLeft = 0
let lastWidth = 0
let minWidth = 0
let startLeft = 0
let startWidth = 0
let widthBeforeLastDblClick = 0

const state = ref<State>({
  collapsed: false,
  pressed: false
})

const init = () => {
  const pane = getPane()
  lastDownX = 0
  lastLeft = pane.offsetLeft || lastLeft
  lastWidth = pane.scrollWidth || lastWidth
  minWidth = minWidth || 5
  startLeft = pane.offsetLeft || startLeft
  startWidth = pane.scrollWidth || startWidth
  widthBeforeLastDblClick = 0

  setWidth(props.width)
  setLeft(props.left)

  document.addEventListener('mouseup', onMouseUp)
  document.addEventListener('mousemove', onMouseMove)
  debouncedResizeHandler = debounce(handleResize, 250)
  if (props.type === PaneResizeType.WidthAndOffset) {
    window.addEventListener('resize', debouncedResizeHandler)
  }
}
// ========== init end ==========

// ---------- event ----------
onBeforeUnmount(() => {
  resizerElementRef.value?.removeEventListener('dblclick', onMouseDblClick)
  document.removeEventListener('mouseup', onMouseUp)
  document.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('resize', debouncedResizeHandler)
})

onMounted(() => {
  init()
  resizerElementRef.value?.addEventListener('dblclick', onMouseDblClick)
})

onUpdated(() => {
  const _isCollapsed = isCollapsed()
  if (_isCollapsed !== state.value.collapsed) {
    state.value.collapsed = _isCollapsed
  }
})

const onMouseDblClick = () => {
  const collapsed = isCollapsed()
  if (collapsed) {
    setWidth(widthBeforeLastDblClick || props.defaultWidth || 0)
  } else {
    widthBeforeLastDblClick = lastWidth
    setWidth(minWidth)
  }
  finishSetWidth()
}

const onMouseDown = (event: MouseEvent) => {
  invisibleOverlayAdd()
  lastDownX = event.clientX

  const pane = getPane()
  startLeft = pane.offsetLeft
  startWidth = pane.scrollWidth

  state.value.pressed = true
}

const onMouseMove = (event: MouseEvent) => {
  if (!state.value.pressed) {
    return
  }
  event.preventDefault()
  if (props.side === PaneSide.Left) {
    handleEventLeft(event)
  } else {
    handleEventWidth(event)
  }
}

const onMouseUp = () => {
  invisibleOverlayDel()
  if (!state.value.pressed) {
    return
  }
  state.value.pressed = false
  finishSetWidth()
}

const finishSetWidth = () => {
  if (!props.collapsable) {
    return
  }

  state.value.collapsed = isCollapsed()
  startWidth = lastWidth
}

const handleEventLeft = (event: MouseEvent) => {
  const pane = getPane()

  const paneRect = pane.getBoundingClientRect()
  const x = event.clientX || paneRect.x
  let deltaX = x - lastDownX
  let newLeft = startLeft + deltaX
  if (newLeft < 0) {
    newLeft = 0
    deltaX = -startLeft
  }
  const parentRect = getParentRect()
  let newWidth = startWidth - deltaX
  if (newWidth < minWidth) {
    newWidth = minWidth
  }
  if (newWidth > parentRect.width) {
    newWidth = parentRect.width
  }
  if (newLeft + newWidth > parentRect.width) {
    newLeft = parentRect.width - newWidth
  }
  setLeft(newLeft)
  setWidth(newWidth, false)
}

const handleEventWidth = (event?: MouseEvent) => {
  let x
  if (event) {
    x = event.clientX
  } else {
    x = 0
    lastDownX = 0
  }
  const deltaX = x - lastDownX
  const newWidth = startWidth + deltaX
  const adjustedWidth = setWidth(newWidth, false)
  emit('onWidthChange', adjustedWidth)
}

const setLeft = (left: number) => {
  const pane = getPane()
  pane.style.left = left + 'px'
  lastLeft = left
}

const setWidth = (width: number, finish = false): number => {
  if (width === 0) {
    width = computeMaxWidth()
  }
  if (width < minWidth) {
    width = minWidth
  }

  const parentRect = getParentRect()
  if (width > parentRect.width) {
    width = parentRect.width
  }

  const pane = getPane()
  const clientRect = pane.getBoundingClientRect() as DOMRect
  const maxWidth = getAppFrame().width - clientRect.x
  if (width > maxWidth) {
    width = maxWidth
  }

  const isFullWidth = Math.round(width + lastLeft) === Math.round(parentRect.width)
  if (props.modifyElementWidth) {
    if (isFullWidth) {
      if (props.type === PaneResizeType.WidthOnly) {
        pane.style.removeProperty('width')
      } else {
        pane.style.width = `calc(100% - ${lastLeft}px)`
      }
    } else {
      pane.style.width = width + 'px'
    }
  }

  lastWidth = width

  if (finish) {
    finishSetWidth()
  }

  return width
}

const handleResize = () => {
  const pane = getPane()
  const _startWidth = isAtMaxWidth() ? computeMaxWidth() : pane.scrollWidth

  startWidth = _startWidth
  lastWidth = _startWidth

  handleEventWidth()
  finishSetWidth()
}
// ========== event end ==========

// ---------- other ----------
const getAppFrame = () => {
  return document.getElementById(eleIds.app)?.getBoundingClientRect() as DOMRect
}

const getPane = () => {
  const { pane } = toRefs(props)
  const paneV = pane.value

  if (paneV instanceof Array) {
    return paneV[0].$el
  } else {
    // eslint-disable-next-line no-unused-expressions
    return paneV.$el || paneV
  }
}

const getParentRect = () => {
  const pane = getPane()
  if (!pane.parentNode) {
    return new DOMRect()
  }

  return (pane.parentNode as HTMLElement).getBoundingClientRect()
}

const isAtMaxWidth = () => {
  const marginOfError = 5
  const difference = Math.abs(Math.round(lastWidth + lastLeft) - Math.round(getParentRect().width))
  return difference < marginOfError
}

const isCollapsed = (): boolean => {
  return lastWidth <= minWidth
}

const computeMaxWidth = (): number => {
  const parentRect = getParentRect()
  let width = parentRect.width - props.left
  if (width < minWidth) {
    width = minWidth
  }
  return width
}

const invisibleOverlayAdd = () => {
  if (overlay.value) {
    return
  }
  const overlayElement = document.createElement('div')
  overlayElement.id = eleIds.overlay
  overlay.value = overlayElement
  document.body.prepend(overlay.value)
}

const invisibleOverlayDel = () => {
  if (overlay.value) {
    overlay.value.remove()
    overlay.value = undefined
  }
}
</script>

<style lang="scss">
.pane-resizer {
  -webkit-app-region: no-drag;
  background-color: var(--enas-background-secondary-color);
  border-bottom-width: 0px;
  border-top-width: 0px;
  cursor: col-resize;
  height: 100%;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  right: 0;
  top: var(--enas-desktop-title-bar-height);
  width: 4px;
  z-index: var(--enas-z-index-pane-resizer);
}
</style>

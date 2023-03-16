<template>
  <div :id="holder"></div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import EditorJS, { OutputData } from '@editorjs/editorjs'

import { useAppStore } from '@/pinia/modules/app'
import { mergeConfig } from './conf'
import { Props } from './types'

const appStore = useAppStore()

const props = defineProps({
  content: {
    type: String,
    default: () => (''),
    require: true
  },
  holder: {
    type: String,
    default: () => 'editorjs-holder'
  },
  initCallback: {
    type: Function,
    default: () => ({})
  },
  updateCallback: {
    type: Function,
    default: () => ({})
  }
})

// For better code hints. Refer: https://juejin.cn/post/7012814138145505287
interface emitType {
  (e: 'editorUpdate', value: string): void
}

const emits = defineEmits<emitType>()
const editorJs = ref<EditorJS>()
let saveTimer: number
const saveTimerSeconds = 5 // TODO: can put it in config

const editorInit = () => {
  if (!editorDestroy()) {
    console.log('editorDestroy error')
  }

  const conf = mergeConfig({
    contentPlaceholder: '',
    contentData: JSON.parse(props.content) as OutputData
  } as Props)

  editorJs.value = new EditorJS({
    holder: props.holder,
    ...conf,

    // onReady callback
    onReady: () => {
      console.log('Editor.js is ready to work!')
      props.initCallback(editorJs)
      saveTimer = setInterval(editorSave, saveTimerSeconds * 1000)
    },
    // onChange callback
    onChange: (_api, event) => {
      console.log('Now I know that Editor\'s content changed!', event)
      props.updateCallback()
    }
  })
}

const editorSave = () => {
  // Refer: https://editorjs.io/saving-data/
  if (editorJs.value) {
    try {
      editorJs.value.save().then((outputObj: object) => {
        const json = JSON.stringify(outputObj)
        console.log('>>> Editor updated json: ', json)
        emits('editorUpdate', json)
      }).catch((error) => {
        console.log('Saving failed: ', error)
      })
    } catch (error) {

    }
  }
}

const editorDestroy = () => {
  if (editorJs.value) {
    try {
      editorJs.value.destroy()
    } catch (error) {

    }
    editorJs.value = undefined
  }
  clearInterval(saveTimer)
  return true
}

onMounted(() => {
  editorInit()
})

let lastChangeLocaleTimestamp = 0
appStore.$subscribe((mutation, state) => {
  const info = state.data
  const changeLocaleTimestamp = info.changeLocaleTimestamp
  if (changeLocaleTimestamp > lastChangeLocaleTimestamp) {
    lastChangeLocaleTimestamp = changeLocaleTimestamp

    // Save data and reinit
    editorSave()
    editorInit()
  }
})
</script>

<style lang="scss">
.codex-editor {

  .ce-block__content,
  .ce-toolbar__content {
    max-width: 100%;
  }

  .ce-toolbar__actions {
    background-color: var(--enas-border-color);
  }

  // ---------- change table border ----------
  .tc-table,
  .tc-add-column {
    --color-border: var(--enas-border-color);
  }

  .tc-table {
    border-left: 1px solid var(--color-border);
  }

  // ========== change table border end ==========

  // remove padding of marker
  .cdx-marker {
    padding: 0;
  }
}

@media (min-width: 651px) {
  .codex-editor--narrow {
    // ---------- change action button on left side ----------

    .codex-editor__redactor {
      margin-right: 0 !important; // 50px
      margin-left: 50px !important;
    }

    .ce-toolbar__actions {
      right: auto !important; // -5px
      left: -10px !important;
    }

    .ce-toolbox {
      left: 0 !important; // auto
      right: auto !important; // 0
    }

    .ce-toolbox .ce-popover {
      right: auto !important; // 0
      left: 0 !important;
    }

    .ce-block--focused {
      margin-right: 0 !important; // -50px;
      padding-right: 0 !important; // 50px;
      padding-left: 50px;
      margin-left: -50px;
    }
  }

  // ========== change action button on left side ==========
}
</style>

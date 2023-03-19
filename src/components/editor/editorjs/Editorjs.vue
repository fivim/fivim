<template>
  <div :id="holder"></div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import EditorJS, { OutputData } from '@editorjs/editorjs'

import { mergeConfig } from './conf'
import { Props } from './types'

const props = defineProps({
  content: {
    type: String,
    default: () => ('{}'),
    require: true
  },
  holder: {
    type: String,
    default: () => 'editorjs-holder'
  }
})

// For better code hints. Refer: https://juejin.cn/post/7012814138145505287
interface emitType {
  (e: 'onUpdate', value: string): void
}

const emits = defineEmits<emitType>()
const editorJs = ref<EditorJS>()
let saveTimer: number

const init = (jsonStr: string) => {
  if (!destroy()) {
    console.log('editorDestroy error')
  }

  const conf = mergeConfig({
    contentPlaceholder: '',
    contentData: JSON.parse(jsonStr) as OutputData
  } as Props)

  editorJs.value = new EditorJS({
    holder: props.holder,
    ...conf,

    // onReady callback
    onReady: () => {
      console.log('Editor.js is ready!')
    },
    // onChange callback
    onChange: (_api, event) => {
      console.log('Now I know that Editor\'s content changed!', event)
      save()
    }
  })
}

const save = () => {
  // Refer: https://editorjs.io/saving-data/
  if (editorJs.value) {
    try {
      editorJs.value.save().then((outputObj: object) => {
        const json = JSON.stringify(outputObj)
        emits('onUpdate', json)
      }).catch((error) => {
        console.log('editorSave failed: ', error)
      })
    } catch (error) {

    }
  }
}

const destroy = () => {
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

const setContent = (jsonStr: string) => {
  if (editorJs.value) {
    try {
      // Save data and reinit
      save()
      init(jsonStr)
    } catch (error) {
      console.log('editorSetContent failed: ', error)
    }
  }
}

onMounted(() => {
  init(props.content)
})

defineExpose({ setContent })
</script>

<style lang="scss">
.codex-editor {

  .ce-block__content,
  .ce-toolbar__content {
    max-width: 100%;
  }

  .ce-toolbar__actions {
    background-color: var(--enas-border-color);
    right: auto !important;
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

// ---------- change action button on left side ----------
// Both desktop and mobile.
.codex-editor__redactor {
  margin-right: 0 !important; // 50px
  margin-left: 50px !important;
}

// Only for mobile.
@media (min-width: 651px) {
  .codex-editor--narrow {
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
}

// ========== change action button on left side ==========
</style>

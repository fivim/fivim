<template>
  <div :id="holder"></div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import EditorJS, { OutputData } from '@editorjs/editorjs'

import { CmdInvoke } from '@/libs/commands'
import { mergeConfig } from '@/libs/editorjs/conf'
import { Props } from '@/libs/editorjs/types'

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
    CmdInvoke.logError('editorDestroy error')
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
      //
    },
    // onChange callback
    onChange: (_api, event) => {
      //
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
        CmdInvoke.logError('editorSave failed: ' + error)
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
      CmdInvoke.logError('editorSetContent failed: ' + error)
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

  .tc-table,
  .tc-add-column {
    --color-border: var(--enas-border-color);
  }

  .ce-toolbar__plus,
  .ce-toolbar__settings-btn {
    background-color: var(--enas-border-color);
  }

  @media (min-width: 651px) {
    &.codex-editor--narrow .codex-editor__redactor {
      margin-right: 0 !important;
    }

    &.codex-editor--narrow .ce-block--focused {
      margin-right: 0 !important;
      padding-right: 0 !important;
    }

    .ce-settings {
      right: 200px !important;
      left: auto;
    }
  }
}
</style>

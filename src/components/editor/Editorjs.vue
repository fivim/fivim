<template>
  <div :id="holder"></div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import EditorJS, { OutputData } from '@editorjs/editorjs'
import { open as openDialog } from '@tauri-apps/api/dialog'
import { join as pathJoin } from '@tauri-apps/api/path'

import { TaskImportMd, TaskExportMd } from '@/constants'
import { useAppStore } from '@/pinia/modules/app'
import { invoker } from '@/libs/commands/invoke'
import { mergeConfig } from '@/libs/editorjs/conf'
import { exporter } from '@/libs/editorjs/plugins/markdown-parser/src/MarkdownExporter'
import { importer, editorData } from '@/libs/editorjs/plugins/markdown-parser/src/MarkdownImporter'
import { Props } from '@/libs/editorjs/types'

const props = defineProps({
  content: {
    type: String,
    default: '{}',
    require: true
  },
  holder: {
    type: String,
    default: 'editorjs-holder'
  }
})

const appStore = useAppStore()

// For better code hints. Refer: https://juejin.cn/post/7012814138145505287
interface emitType {
  (e: 'onUpdate', value: string): void
}

const emits = defineEmits<emitType>()
const editorJs = ref<EditorJS>()

const init = (jsonStr: string) => {
  if (jsonStr === '') {
    return
  }

  if (!destroy()) {
    invoker.logError('editorDestroy error')
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
      save()
    }
  })
}

const save = () => {
  // Refer: https://editorjs.io/saving-data/
  if (editorJs.value) {
    try {
      editorJs.value.save().then((outputObj) => {
        const json = JSON.stringify(outputObj)
        emits('onUpdate', json)
      }).catch((error) => {
        invoker.logError('editorSave failed: ' + error)
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
  return true
}

const setContent = (jsonStr: string) => {
  if (editorJs.value) {
    try {
      init(jsonStr)
    } catch (error) {
      invoker.logError('editorSetContent failed: ' + error)
    }
  } else {
    init(jsonStr)
  }
}

// -------- import / export ---------

const getMdPath = (useDirectory: boolean) => {
  return openDialog({
    directory: useDirectory
  }).then((selected) => {
    let path = ''
    if (Array.isArray(selected)) {
      // user selected multiple files
      path = selected[0]
    } else if (selected === null) {
      // user cancelled the selection
    } else {
      // user selected a single file
      path = selected
    }
    return path
  })
}

const importMd = async (path: string) => {
  const mdContent = await invoker.readFileToString(path)
  importer(mdContent)

  // clear the editor
  editorJs.value?.blocks.clear()
  // render the editor with imported markdown data
  editorJs.value?.blocks.render({
    blocks: editorData.filter((value) => Object.keys(value).length !== 0) // filter through array and remove empty objects
  })

  appStore.data.progress.simpleTaskName = ''
}

const exportMd = async (path: string) => {
  const data = await editorJs.value?.saver.save()
  const emptc = exporter(data?.blocks)

  await invoker.writeStringIntoFile(path, emptc)

  appStore.data.progress.simpleTaskName = ''
}

appStore.$subscribe(async (mutation, state) => {
  const taskName = state.data.progress.simpleTaskName
  if (taskName === TaskImportMd) {
    importMd(await getMdPath(false))
  } else if (taskName === TaskExportMd) {
    const dir = await getMdPath(true)
    const path = await pathJoin(dir, appStore.data.currentFile.title + '.md')
    exportMd(path)
  }
})

// -------- import / export end ---------

onMounted(() => {
  init(props.content)
})

defineExpose({ init, setContent })
</script>

<style lang="scss">
.codex-editor {
  overflow-x: hidden;

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

  // ---------- color ----------
  .ce-popover {
    background-color: var(--enas-editor-col-background-color);
    border-color: var(--enas-border-color);
  }

  .ce-popover__item-icon,
  .ce-popover__item-label {
    color: var(--enas-foreground-primary-color);
    background-color: var(--enas-editor-col-background-color);
  }

  .ce-inline-toolbar,
  .ce-conversion-toolbar {
    background-color: var(--enas-background-secondary-color);
    border-color: var(--enas-border-color);
  }

  .ce-conversion-tool__icon,
  .ce-inline-toolbar__dropdown:hover {
    background-color: var(--enas-background-secondary-color);
  }

  .ce-conversion-tool:hover,
  .ce-inline-tool:hover {
    background-color: var(--enas-highlight-color);
  }

  @media (hover: hover) {
    .ce-popover__item:hover:not(.ce-popover__item--no-visible-hover) {
      background-color: var(--enas-background-secondary-color);

      .ce-popover__item-label {
        background-color: var(--enas-background-secondary-color);
      }
    }
  }
}

// ---------- color end ----------
</style>

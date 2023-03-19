import { useAppStore } from '@/pinia/modules/app'
import { useSettingStore } from '@/pinia/modules/settings'
import { usePaneDataStore } from '@/pinia/modules/pane_data'
import { OrderedFieldArrayTable } from '@/utils/array'
import { formatDateTime } from '@/utils/string'
import { jsonCopy } from '@/utils/utils'

import { EntryFileSourceNotebooksTagsAttrsArrKey, EntryFileSource, NotebookSource } from './types'
import { tmplNotebookAttrsArr, tmplEntryFileData, tmplNotebook } from './types_templates'
import { getEntryFileName, genCurrentNotebookFileName, updateFileMeta, writeEncryptedUserDataToFile } from './utils'
import { Note } from '@/components/pane/types'

export const saveEntryFile = async () => {
  const appStore = useAppStore()
  const paneDataStore = usePaneDataStore()

  const content: EntryFileSource = jsonCopy(tmplEntryFileData)

  // notebooks
  const tn = new OrderedFieldArrayTable([])
  const notebooksData = paneDataStore.data.navigationCol.notebooks // It's a Proxy
  const notebooksDataLast = jsonCopy(notebooksData) // Get the value of Proxy
  tn.fromObjectArray(notebooksDataLast, {})
  content.noteBooks.attrsArr = tn.toFieldArray().keysArr as EntryFileSourceNotebooksTagsAttrsArrKey[]
  content.noteBooks.dataArr = tn.toFieldArray().valuesArr as string[][]

  // tags
  const tt = new OrderedFieldArrayTable([])
  const tagsData = paneDataStore.data.navigationCol.tags // It's a Proxy
  const tagsDataLast = jsonCopy(tagsData) // Get the value of Proxy
  tt.fromObjectArray(tagsDataLast, {})
  content.tags.attrsArr = tt.toFieldArray().keysArr as EntryFileSourceNotebooksTagsAttrsArrKey[]
  content.tags.dataArr = tt.toFieldArray().valuesArr as string[][]

  // attachments

  // files

  // fileMetaMapping
  content.fileMetaMapping = appStore.data.fileMetaMapping
  if (import.meta.env.TAURI_DEBUG) {
    console.log('>>> saveEntryFile content:: ', content)
  }

  const p = appStore.data.dataPath
  return writeEncryptedUserDataToFile(p.pathOfCurrentDir, getEntryFileName(), JSON.stringify(content))
}

export const genNotebookFileContent = (notes: Note[]) => {
  const settingStore = useSettingStore()
  const settings = settingStore.data
  const dateTimeFormat = settings.appearance.dateTimeFormat

  const content: NotebookSource = jsonCopy(tmplNotebook)

  // Notebook data has a tagsArr need to join with ',', as a string.
  // Need special handling for tagsArr.
  const arr = jsonCopy(tmplNotebookAttrsArr) as string[]
  arr.push('tagsArr') // Add tagsArr, as the last field, remove it later
  const tcn = new OrderedFieldArrayTable(arr)

  const listDataLast = jsonCopy(notes) // Get the value of Proxy

  tcn.fromObjectArray(listDataLast, {
    createTime: (item: unknown, currentObj: object) => {
      return {
        currentItemAfter: formatDateTime(new Date(item as string), dateTimeFormat),
        moveToNewNewFieldName: ''
      }
    },
    updateTime: (item: unknown, currentObj: object) => {
      return {
        currentItemAfter: formatDateTime(new Date(item as string), dateTimeFormat),
        moveToNewNewFieldName: ''
      }
    },
    tagsArr: (item: unknown, currentObj: object) => {
      const list = item as string[]
      const newItemValue = list.join(',')
      console.log('>>> newItemValue ::', newItemValue)
      return {
        currentItemAfter: newItemValue,
        moveToNewNewFieldName: 'tagsHashedSign'
      }
    }
  })
  // Remove the tagsArr filed
  const outArr = tcn.toFieldArray().valuesArr as string[][]
  for (let index = 0; index < outArr.length; index++) {
    const element = outArr[index]
    element.pop()
    content.dataArr.push(element)
  }

  console.log('>>> after convert ::', content)
  return content
}

export const saveNotebookFileWithContent = async (fileName: string, content: NotebookSource) => {
  const appStore = useAppStore()
  const p = appStore.data.dataPath
  return await writeEncryptedUserDataToFile(p.pathOfCurrentDir, fileName, JSON.stringify(content))
}

// Set a fileName while isCurrent is true
export const saveNotebookFile = async (isCurrent: boolean, fileName: string) => {
  const appStore = useAppStore()
  const paneDataStore = usePaneDataStore()
  let content: NotebookSource

  // save the data of the notebook opened currently
  if (isCurrent) {
    if (paneDataStore.data.listCol.list.length === 0) {
      return Promise.resolve(true)
    }

    fileName = genCurrentNotebookFileName()
    content = genNotebookFileContent(paneDataStore.data.listCol.list)
  } else {
    if (fileName === '') {
      // TODO alert error
      return
    }
    content = genNotebookFileContent([])
  }

  if (import.meta.env.TAURI_DEBUG) {
    console.log('>>> saveNotebookFile content:: ', content)
  }

  const p = appStore.data.dataPath
  if (!saveNotebookFileWithContent(fileName, content)) {
    return Promise.resolve(false)
  } else {
    updateFileMeta(p.pathOfCurrentDir, fileName)
    return Promise.resolve(true)
  }
}

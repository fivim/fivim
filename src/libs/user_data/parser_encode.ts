import { useAppStore } from '@/pinia/modules/app'
import { useSettingStore } from '@/pinia/modules/settings'
import { usePaneDataStore } from '@/pinia/modules/pane_data'
import { getDataDirs } from '@/libs/init/dirs'
import { OrderedFieldArrayTable } from '@/utils/array'
import { formatDateTime } from '@/utils/string'
import { jsonCopy } from '@/utils/utils'

import { NotebookAttrsArrKey, EntryFileSource, NotebookSource } from './types'
import { tmplNotebookAttrsArr, tmplNoteAttrsArr, tmplEntryFileData, tmplNotebook } from './types_templates'
import { getEntryFileName, genCurrentNotebookFileName, updateFileMeta, writeEncryptedUserDataToFile } from './utils'
import { Note } from '@/components/pane/types'

const ofatTagArrCallback = (item: unknown, currentObj: object) => {
  const list = item as string[]
  const newItemValue = list.join(',')
  return {
    currentItemAfter: newItemValue,
    moveToNewNewFieldName: 'tagsHashedSign'
  }
}

export const saveEntryFile = async () => {
  const appStore = useAppStore()
  const paneDataStore = usePaneDataStore()

  const content: EntryFileSource = jsonCopy(tmplEntryFileData)

  // notebooks
  const notebooksData = paneDataStore.data.navigationCol.notebooks
  // Notebook data has a tagsArr need to join with ',', as a string.
  // Need special handling for tagsArr.
  const arr = jsonCopy(tmplNotebookAttrsArr) as string[]
  arr.push('tagsArr') // Add tagsArr, as the last field, remove it later
  const ofatn = new OrderedFieldArrayTable(arr)
  const nbData = jsonCopy(notebooksData) // Get the value of Proxy

  ofatn.fromObjectArray(nbData, {
    tagsArr: ofatTagArrCallback
  })
  // Remove the tagsArr filed
  const outArr = ofatn.toFieldArray().valuesArr as string[][]
  for (let index = 0; index < outArr.length; index++) {
    const element = outArr[index]
    element.pop()
    content.noteBooks.dataArr.push(element)
  }

  // tags
  const ofatt = new OrderedFieldArrayTable([])
  const tagsData = paneDataStore.data.navigationCol.tags
  ofatt.fromObjectArray(tagsData, {})
  content.tags.attrsArr = ofatt.toFieldArray().keysArr as NotebookAttrsArrKey[]
  content.tags.dataArr = ofatt.toFieldArray().valuesArr as string[][]

  // attachments

  // files

  // fileMetaMapping
  content.fileMetaMapping = appStore.data.fileMetaMapping
  if (import.meta.env.TAURI_DEBUG) {
    console.log('>>> saveEntryFile content:: ', content)
  }

  const p = await getDataDirs()
  return writeEncryptedUserDataToFile(p.pathOfCurrentDir, getEntryFileName(), JSON.stringify(content))
}

export const genNotebookFileContent = (notes: Note[]) => {
  const settingStore = useSettingStore()
  const settings = settingStore.data
  const dateTimeFormat = settings.appearance.dateTimeFormat

  const content: NotebookSource = jsonCopy(tmplNotebook)

  // Note data has a tagsArr need to join with ',', as a string.
  // Need special handling for tagsArr.
  const arr = jsonCopy(tmplNoteAttrsArr) as string[]
  arr.push('tagsArr') // Add tagsArr, as the last field, remove it later
  const ofat = new OrderedFieldArrayTable(arr)
  const nData = jsonCopy(notes) // Get the value of Proxy

  ofat.fromObjectArray(nData, {
    ctimeUtc: (item: unknown, currentObj: object) => {
      return {
        currentItemAfter: formatDateTime(new Date(item as string), dateTimeFormat),
        moveToNewNewFieldName: ''
      }
    },
    mtimeUtc: (item: unknown, currentObj: object) => {
      return {
        currentItemAfter: formatDateTime(new Date(item as string), dateTimeFormat),
        moveToNewNewFieldName: ''
      }
    },
    tagsArr: ofatTagArrCallback
  })
  // Remove the tagsArr filed
  const outArr = ofat.toFieldArray().valuesArr as string[][]
  for (let index = 0; index < outArr.length; index++) {
    const element = outArr[index]
    element.pop()
    content.dataArr.push(element)
  }

  return content
}

export const saveNotebookFileWithContent = async (fileName: string, content: NotebookSource) => {
  const p = await getDataDirs()
  return await writeEncryptedUserDataToFile(p.pathOfCurrentDir, fileName, JSON.stringify(content))
}

// Set a fileName while isCurrent is true
export const saveNotebookFile = async (isCurrent: boolean, fileName: string) => {
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

  const p = await getDataDirs()
  if (!saveNotebookFileWithContent(fileName, content)) {
    return Promise.resolve(false)
  } else {
    updateFileMeta(p.pathOfCurrentDir, fileName)
    return Promise.resolve(true)
  }
}

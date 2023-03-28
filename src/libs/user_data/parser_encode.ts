import { TypeNote } from '@/constants'
import { useAppStore } from '@/pinia/modules/app'
import { invoker } from '@/libs/commands/invoke'
import { getDataDirs } from '@/libs/init/dirs'
import { OrderedFieldArrayTable } from '@/utils/array'
import { jsonCopy } from '@/utils/utils'

import { AttrsArrKeyOfNotebook, AttrsArrKeyOfUserDataFileMeta, EntryFileSourceInfo, NotebookSourceInfo, NoteInfo } from './types'
import { tmplFileAttrsArr, tmplNotebookAttrsArr, tmplNoteAttrsArr, tmplUserDataMetaAttrsArr, tmplEntryFileData, tmplNotebook } from './types_templates'
import { getEntryFileName, genCurrentNotebookFileName, updateFileMeta, writeEncryptedUserDataToFile } from './utils'

const ofatTagArrCallback = (item: string[], currentObj: object) => {
  const newItemValue = item.join(',')
  return {
    currentItemAfter: newItemValue,
    moveToNewNewFieldName: 'tagsSign'
  }
}

const ofatTimeCallback = (item: Date, currentObj: object) => {
  return {
    currentItemAfter: item.toString(),
    moveToNewNewFieldName: ''
  }
}

const ofatNumberCallback = (item: number, currentObj: object) => {
  return {
    currentItemAfter: item.toString(),
    moveToNewNewFieldName: ''
  }
}

export const saveEntryFile = async () => {
  const appStore = useAppStore()

  const content: EntryFileSourceInfo = jsonCopy(tmplEntryFileData)

  // ---------- notebooks ----------
  const notebooksData = appStore.data.userData.notebooks
  // Notebook data has a tagsArr need to join with ',', as a string.
  // Need special handling for tagsArr.
  const attrsNb = jsonCopy(tmplNotebookAttrsArr) as string[]
  attrsNb.push('tagsArr') // Add tagsArr, as the last field, remove it later
  const ofatNb = new OrderedFieldArrayTable(attrsNb)
  const dataNb = notebooksData
  ofatNb.fromObjectArray(dataNb, {
    ctimeUtc: ofatTimeCallback,
    mtimeUtc: ofatTimeCallback,
    tagsArr: ofatTagArrCallback
  })
  // Remove the tagsArr filed
  const ofatnbva = ofatNb.toFieldArray().valuesArr as string[][]
  for (let index = 0; index < ofatnbva.length; index++) {
    const element = ofatnbva[index]
    element.pop()
    content.noteBooks.dataArr.push(element)
  }
  // ---------- notebooks end ----------

  // ---------- files ----------
  const files = appStore.data.userData.files
  // Notebook data has a tagsArr need to join with ',', as a string.
  // Need special handling for tagsArr.
  const attrsFiles = jsonCopy(tmplFileAttrsArr) as string[]
  attrsFiles.push('tagsArr') // Add tagsArr, as the last field, remove it later
  const ofatFiles = new OrderedFieldArrayTable(attrsFiles)
  const dataFiles = files
  ofatFiles.fromObjectArray(dataFiles, {
    ctimeUtc: ofatTimeCallback,
    mtimeUtc: ofatTimeCallback,
    tagsArr: ofatTagArrCallback,
    originalSize: ofatNumberCallback
  })
  // Remove the tagsArr filed
  const ofatfva = ofatFiles.toFieldArray().valuesArr as string[][]
  for (let index = 0; index < ofatfva.length; index++) {
    const element = ofatfva[index]
    element.pop()
    content.files.dataArr.push(element)
  }
  // ---------- files end ----------

  // ---------- tags ----------
  const ofatTag = new OrderedFieldArrayTable([])
  const dataTag = appStore.data.userData.tags
  ofatTag.fromObjectArray(dataTag, {})
  content.tags.attrsArr = ofatTag.toFieldArray().keysArr as AttrsArrKeyOfNotebook[]
  content.tags.dataArr = ofatTag.toFieldArray().valuesArr as string[][]
  // ---------- tags end ----------

  // ---------- userDataFilesMeta ----------
  const attrsUdf = jsonCopy(tmplUserDataMetaAttrsArr) as string[]
  const dataUdf = appStore.data.userData.filesMeta
  const ofatUdf = new OrderedFieldArrayTable(attrsUdf)
  ofatUdf.fromObjectArray(dataUdf, {
    ctimeUtc: ofatTimeCallback,
    dtimeUtc: ofatTimeCallback,
    mtimeUtc: ofatTimeCallback,
    size: ofatNumberCallback
  })
  content.userDataFilesMeta.attrsArr = ofatUdf.toFieldArray().keysArr as AttrsArrKeyOfUserDataFileMeta[]
  content.userDataFilesMeta.dataArr = ofatUdf.toFieldArray().valuesArr as string[][]
  // ---------- userDataFilesMeta end ----------

  const p = await getDataDirs()
  return writeEncryptedUserDataToFile(p.pathOfCurrentDir, getEntryFileName(), content)
}

export const genNotebookFileContent = (notes: NoteInfo[]) => {
  const content: NotebookSourceInfo = jsonCopy(tmplNotebook)

  // Note data has a tagsArr need to join with ',', as a string.
  // Need special handling for tagsArr.
  const arr = jsonCopy(tmplNoteAttrsArr) as string[]
  arr.push('tagsArr') // Add tagsArr, as the last field, remove it later
  const ofat = new OrderedFieldArrayTable(arr)
  const nData = jsonCopy(notes) // Get the value of Proxy

  ofat.fromObjectArray(nData, {
    ctimeUtc: ofatTimeCallback,
    mtimeUtc: ofatTimeCallback,
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

export const saveNotebookFileWithContent = async (fileName: string, content: NotebookSourceInfo) => {
  const p = await getDataDirs()
  return await writeEncryptedUserDataToFile(p.pathOfCurrentDir, fileName, content)
}

// Set a fileName while isCurrent is true
export const saveNotebookFile = async (isCurrent: boolean, fileName: string) => {
  const appStore = useAppStore()
  if (appStore.data.listCol.type !== TypeNote) {
    invoker.logDebug('saveNotebookFile but listCol.type is not TypeNote :: ' + appStore.data.listCol.type)
    return Promise.resolve(true)
  }

  let content: NotebookSourceInfo

  // save the data of the notebook opened currently
  if (isCurrent) {
    if (appStore.data.listCol.noteList.length === 0) {
      return Promise.resolve(true)
    }

    fileName = genCurrentNotebookFileName()
    content = genNotebookFileContent(appStore.data.listCol.noteList as NoteInfo[])
  } else {
    if (fileName === '') {
      invoker.logError('saveNotebookFile but fileName is empty!')
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

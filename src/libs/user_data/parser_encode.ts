import { TypeNote } from '@/constants'
import { usePanesStore } from '@/pinia/modules/panes'
import { CmdInvoke } from '@/libs/commands'
import { getDataDirs } from '@/libs/init/dirs'
import { OrderedFieldArrayTable } from '@/utils/array'
import { jsonCopy } from '@/utils/utils'

import { AttrsArrKeyOfNotebook, EntryFileSource, NotebookSource, NoteInfo } from './types'
import { tmplFileAttrsArr, tmplNotebookAttrsArr, tmplNoteAttrsArr, tmplEntryFileData, tmplNotebook } from './types_templates'
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
  const panesStore = usePanesStore()

  const content: EntryFileSource = jsonCopy(tmplEntryFileData)

  // ---------- notebooks ----------
  const notebooksData = panesStore.data.navigationCol.notebooks
  // Notebook data has a tagsArr need to join with ',', as a string.
  // Need special handling for tagsArr.
  const nbaa = jsonCopy(tmplNotebookAttrsArr) as string[]
  nbaa.push('tagsArr') // Add tagsArr, as the last field, remove it later
  const ofatnb = new OrderedFieldArrayTable(nbaa)
  // const nbData = jsonCopy(notebooksData) // Get the value of Proxy
  const nbData = notebooksData
  ofatnb.fromObjectArray(nbData, {
    ctimeUtc: ofatTimeCallback,
    mtimeUtc: ofatTimeCallback,
    tagsArr: ofatTagArrCallback
  })
  // Remove the tagsArr filed
  const ofatnbva = ofatnb.toFieldArray().valuesArr as string[][]
  for (let index = 0; index < ofatnbva.length; index++) {
    const element = ofatnbva[index]
    element.pop()
    content.noteBooks.dataArr.push(element)
  }
  // ---------- notebooks end ----------

  // ---------- tags ----------
  const ofatt = new OrderedFieldArrayTable([])
  const tagsData = panesStore.data.navigationCol.tags
  ofatt.fromObjectArray(tagsData, {})
  content.tags.attrsArr = ofatt.toFieldArray().keysArr as AttrsArrKeyOfNotebook[]
  content.tags.dataArr = ofatt.toFieldArray().valuesArr as string[][]
  // ---------- tags end ----------

  // ---------- files ----------
  const filesData = panesStore.data.navigationCol.files
  // Notebook data has a tagsArr need to join with ',', as a string.
  // Need special handling for tagsArr.
  const faa = jsonCopy(tmplFileAttrsArr) as string[]
  faa.push('tagsArr') // Add tagsArr, as the last field, remove it later
  const ofatf = new OrderedFieldArrayTable(faa)
  // const fData = jsonCopy(filesData) // Get the value of Proxy
  const fData = filesData
  ofatf.fromObjectArray(fData, {
    ctimeUtc: ofatTimeCallback,
    dtimeUtc: ofatTimeCallback,
    mtimeUtc: ofatTimeCallback,
    tagsArr: ofatTagArrCallback,
    size: ofatNumberCallback
  })
  // Remove the tagsArr filed
  const ofatfva = ofatf.toFieldArray().valuesArr as string[][]
  for (let index = 0; index < ofatfva.length; index++) {
    const element = ofatfva[index]
    element.pop()
    content.files.dataArr.push(element)
  }
  // ---------- files end ----------

  const p = await getDataDirs()
  return writeEncryptedUserDataToFile(p.pathOfCurrentDir, getEntryFileName(), JSON.stringify(content))
}

export const genNotebookFileContent = (notes: NoteInfo[]) => {
  const content: NotebookSource = jsonCopy(tmplNotebook)

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

export const saveNotebookFileWithContent = async (fileName: string, content: NotebookSource) => {
  const p = await getDataDirs()
  return await writeEncryptedUserDataToFile(p.pathOfCurrentDir, fileName, JSON.stringify(content))
}

// Set a fileName while isCurrent is true
export const saveNotebookFile = async (isCurrent: boolean, fileName: string) => {
  const panesStore = usePanesStore()
  if (panesStore.data.listCol.type !== TypeNote) {
    CmdInvoke.logDebug('saveNotebookFile but listCol.type is not TypeNote :: ' + panesStore.data.listCol.type)
    return Promise.resolve(true)
  }

  let content: NotebookSource

  // save the data of the notebook opened currently
  if (isCurrent) {
    if (panesStore.data.listCol.list.length === 0) {
      return Promise.resolve(true)
    }

    fileName = genCurrentNotebookFileName()
    content = genNotebookFileContent(panesStore.data.listCol.list as NoteInfo[])
  } else {
    if (fileName === '') {
      CmdInvoke.logError('saveNotebookFile but fileName is empty!')
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

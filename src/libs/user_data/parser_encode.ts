import { StrSignOk, StrSignErr } from '@/constants'
import { useAppStore } from '@/pinia/modules/app'
import { useSettingStore } from '@/pinia/modules/settings'
import { usePaneDataStore } from '@/pinia/modules/pane_data'
import { CmdInvoke } from '@/libs/commands'
import { i18n } from '@/libs/init/i18n'
import { OrderedFieldArrayTable } from '@/utils/array'
import { formatDateTime, stringToUint8Array } from '@/utils/string'
import { getTimestampMilliseconds } from '@/utils/time'
import { jsonCopy } from '@/utils/utils'

import { EntryFileSourceNotebooksTagsAttrsArrKey, EntryFileSource, NotebookSource } from './types'
import { notebookAttrsArr } from './types_templates'
import { getEntryFileName, genCurrentNotebookFileName } from './utils'

export const writeEncryptedUserDataToFile = (dir: string, fileName: string, userData: string) => {
  const settingStore = useSettingStore()
  const mp = settingStore.data.encryption.masterPassword
  return CmdInvoke.writeUserDataFile(mp, dir + fileName, fileName, stringToUint8Array(JSON.stringify(userData)), '')
}

const entryFileTemplate: EntryFileSource = {
  dataVersion: 1,
  noteBooks: {
    attrsArr: [
      'title',
      'icon',
      'hashedSign',
      'mtimeUtc'
    ],
    dataArr: []
  },
  tags: {
    attrsArr: [
      'title',
      'icon',
      'hashedSign',
      'mtimeUtc'
    ],
    dataArr: []
  },
  attachments: {
    attrsArr: [],
    dataArr: []
  },
  // files: {
  //   attrsArr: [],
  //   dataArr: []
  // },
  fileMetaMapping: {},
  syncLockFileName: ''
}

const notebookTemplate: NotebookSource = {
  dataVersion: 1,
  attrsArr: notebookAttrsArr,
  dataArr: []
}

const saveEntryFile = async () => {
  const appStore = useAppStore()
  const paneDataStore = usePaneDataStore()

  const content: EntryFileSource = jsonCopy(entryFileTemplate)

  // notebooks
  const tn = new OrderedFieldArrayTable([])
  const notebooksData = paneDataStore.data.navigationColumn.notebooks // It's a Proxy
  const notebooksDataLast = jsonCopy(notebooksData) // Get the value of Proxy
  tn.fromObjectArray(notebooksDataLast, {})
  content.noteBooks.attrsArr = tn.toFieldArray().keysArr as EntryFileSourceNotebooksTagsAttrsArrKey[]
  content.noteBooks.dataArr = tn.toFieldArray().valuesArr as string[][]

  // tags
  const tt = new OrderedFieldArrayTable([])
  const tagsData = paneDataStore.data.navigationColumn.tags // It's a Proxy
  const tagsDataLast = jsonCopy(tagsData) // Get the value of Proxy
  tt.fromObjectArray(tagsDataLast, {})
  content.tags.attrsArr = tt.toFieldArray().keysArr as EntryFileSourceNotebooksTagsAttrsArrKey[]
  content.tags.dataArr = tt.toFieldArray().valuesArr as string[][]

  // attachments

  // files

  // fileMetaMapping
  content.fileMetaMapping = appStore.data.fileMetaMapping

  console.log('>>> saveEntryFile content:: ', content)

  const p = appStore.data.dataPath
  return writeEncryptedUserDataToFile(p.pathOfCurrentDir, getEntryFileName(), JSON.stringify(content))
}

// Set a fileName while isCurrentOpened is true
const saveNotebookFile = async (isCurrentOpened: boolean, fileName: string) => {
  const appStore = useAppStore()
  const paneDataStore = usePaneDataStore()
  const settingStore = useSettingStore()
  const settings = settingStore.data

  const content: NotebookSource = jsonCopy(notebookTemplate)

  // save the data of the notebook opened currently
  if (isCurrentOpened) {
    if (paneDataStore.data.itemsColumn.list.length === 0) {
      return Promise.resolve(true)
    }

    fileName = genCurrentNotebookFileName()
    const dateTimeFormat = settings.appearance.dateTimeFormat

    // Notebook data has a tagsArr need to join with ',', as a string.
    // Need special handling for tagsArr.
    const arr = jsonCopy(notebookAttrsArr) as string[]
    arr.push('tagsArr') // Add tagsArr, as the last field, remove it later
    const tcn = new OrderedFieldArrayTable(arr)

    const listData = paneDataStore.data.itemsColumn.list // It's a Proxy
    const listDataLast = jsonCopy(listData) // Get the value of Proxy

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

        return {
          currentItemAfter: list.join(','),
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
  }

  const p = appStore.data.dataPath
  const writeRes = await writeEncryptedUserDataToFile(p.pathOfCurrentDir, fileName, JSON.stringify(content))

  if (!writeRes) {
    return Promise.resolve(false)
  } else {
    const filePath = p.pathOfCurrentDir + fileName
    const sha256 = await CmdInvoke.sha256ByFilePath(filePath)
    const fileMeta = {
      dtimeUtc: 0,
      mtimeUtc: getTimestampMilliseconds(),
      sha256
    }
    appStore.data.fileMetaMapping[fileName] = fileMeta
    return Promise.resolve(true)
  }
}

export const saveUserData = async (): Promise<string> => {
  const paneDataStore = usePaneDataStore()
  const t = i18n.global.t

  // Save current notebook, and record the sha256 into entry file
  return saveNotebookFile(true, '').then((saveNotebookRes) => {
    if (paneDataStore.data.itemsColumn.list.length > 0) {
      if (!saveNotebookRes) {
        return t('&Failed to save file:', { fileName: genCurrentNotebookFileName() })
      }
    }

    return saveEntryFile().then((saveEntryFileRes) => {
      if (!saveEntryFileRes) {
        return t('&Failed to save file:', { fileName: getEntryFileName() })
      }
      return StrSignOk
    })
  })
}

export const saveUserDataAndCreateNotebookFile = async (fileName: string): Promise<string> => {
  const sur = await saveUserData()
  if (sur === StrSignOk) {
    return saveNotebookFile(false, fileName).then((saveRes) => {
      if (saveRes) {
        return StrSignOk
      } else {
        return StrSignErr
      }
    })
  }

  return sur
}

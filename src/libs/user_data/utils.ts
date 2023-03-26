import { ElMessage } from 'element-plus'

import { ErrorMessages } from '@/types'
import { StrSignOk, StrSignErr } from '@/constants'
import { getDataDirs } from '@/libs/init/dirs'
import { useAppStore } from '@/pinia/modules/app'
import { useSettingStore } from '@/pinia/modules/settings'
import { usePanesStore } from '@/pinia/modules/panes'
import { CmdInvoke } from '@/libs/commands'
import { stringToUint8Array } from '@/utils/string'
import { i18n } from '@/libs/init/i18n'

import { parseNotebookJson } from './parser_decode'
import { saveNotebookFile, saveEntryFile, genNotebookFileContent, saveNotebookFileWithContent } from './parser_encode'

export const getEntryFileName = () => {
  const settingStore = useSettingStore()
  return settingStore.data.encryption.entryFileName
}

export const genCurrentNotebookFileName = () => {
  const settingStore = useSettingStore()
  const panesStore = usePanesStore()
  const sign = panesStore.data.listCol.sign
  const senc = settingStore.data.encryption
  return `${sign}${senc.fileExt}`
}

export const getNotebookFilePath = async (sign: string) => {
  const settingStore = useSettingStore()
  const p = await getDataDirs()
  return p.pathOfCurrentDir + sign + settingStore.data.encryption.fileExt
}

export const writeEncryptedUserDataToFile = (dir: string, fileName: string, content: string) => {
  if (import.meta.env.TAURI_DEBUG) {
    console.log('>>> writeEncryptedUserDataToFile content:: ', JSON.parse(content))
  }

  return CmdInvoke.writeUserDataFile('', dir + fileName, fileName, stringToUint8Array(content), '')
}

export const readNotebookdata = async (sign: string) => {
  const fileData = await CmdInvoke.readUserDataFile('', await getNotebookFilePath(sign), true, 'string', '')

  if (fileData.crc32 !== fileData.crc32_check) {
    const msg = ErrorMessages.FileVerificationFailed
    CmdInvoke.logError(msg + ` >>> crc32_check: ${fileData.crc32_check}, crc32: ${fileData.crc32}`)
    // return Promise.reject(new Error(msg))
  }

  if (fileData.file_data_str.length === 0) {
    CmdInvoke.logError('>>> readNotebookdata readUserDataFile get empty content')
  }
  const jsonStr = fileData.file_data_str

  if (import.meta.env.TAURI_DEBUG) {
    console.log('>>> readNotebookdata notesData:: ', JSON.parse(jsonStr))
  }

  return parseNotebookJson(jsonStr) // call JSON.parse to get a JSON string
}

export const writeUserData = (filePath: string, fileName: string, fileContent: Uint8Array) => {
  return CmdInvoke.writeUserDataFile('', filePath, fileName, fileContent, '')
}

export const updateFileMeta = async (dir: string, fileName: string) => {
  const panesStore = usePanesStore()
  const pd = panesStore.data

  const files = pd.navigationCol.files
  for (const item of files) {
    if (item.sign === fileName) {
      item.mtimeUtc = new Date()
      if (dir !== '') {
        item.sha256 = await CmdInvoke.sha256ByFilePath(dir + fileName)
      }
      break
    }
  }
  panesStore.setData(pd)
}

export const deleteFileMeta = async (fileName: string) => {
  const panesStore = usePanesStore()
  const pd = panesStore.data

  const files = pd.navigationCol.files
  for (const item of files) {
    if (item.sign === fileName) {
      item.dtimeUtc = new Date()
      break
    }
  }
  panesStore.setData(pd)
}

const deleteFileInCurrentDir = async (fileName: string) => {
  const p = await getDataDirs()
  const filePath = p.pathOfCurrentDir + fileName
  return await CmdInvoke.deleteFile(filePath)
}

export const saveToEntryFile = async () => {
  const t = i18n.global.t
  const saveEntryFileRes = await saveEntryFile()
  if (!saveEntryFileRes) {
    return t('&Failed to save file:', { fileName: getEntryFileName() })
  }
  return StrSignOk
}

export const saveCurrentNotebook = async (): Promise<string> => {
  const panesStore = usePanesStore()
  const t = i18n.global.t

  // Save current notebook, and record the sha256 into entry file
  return saveNotebookFile(true, '').then((saveNotebookRes) => {
    if (panesStore.data.listCol.list.length > 0) {
      if (!saveNotebookRes) {
        return t('&Failed to save file:', { fileName: genCurrentNotebookFileName() })
      }
    }

    return saveToEntryFile()
  })
}

export const saveCurrentNotebookAndCreateNotebookFile = async (fileName: string): Promise<string> => {
  const sur = await saveCurrentNotebook()
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

export const saveCurrentNotebookData = async () => {
  const t = i18n.global.t
  const errMsg = await saveCurrentNotebook()
  if (errMsg === StrSignOk) {
    ElMessage({
      message: t('Operation succeeded'),
      type: 'success'
    })
  } else {
    ElMessage({
      message: errMsg,
      type: 'error'
    })
  }
}

export const deleteNotebook = async (sign: string) => {
  const panesStore = usePanesStore()
  const navColData = panesStore.data.navigationCol
  for (let index = 0; index < navColData.notebooks.length; index++) {
    // delete the data in paneData
    if (navColData.notebooks[index].sign === sign) {
      navColData.notebooks.splice(index, 1)
      panesStore.setNavigationColData(navColData)
    }
  }

  saveToEntryFile()
  deleteFileMeta(sign)

  const t = i18n.global.t
  if (await deleteFileInCurrentDir(sign)) {
    ElMessage({
      type: 'success',
      message: t('Operation succeeded')
    })
  } else {
    ElMessage({
      type: 'error',
      message: t('Operation failure')
    })
  }
}

export const deleteTag = async (sign: string) => {
  const panesStore = usePanesStore()
  const navColData = panesStore.data.navigationCol
  const listColData = panesStore.data.listCol
  for (let ti = 0; ti < navColData.tags.length; ti++) {
    // Loop and delete tag of notebooks and notes
    for (let nbi = 0; nbi < navColData.notebooks.length; nbi++) {
      const nb = navColData.notebooks[nbi]
      const nbti = nb.tagsArr.indexOf(sign)
      // Delete tag of notebook
      if (nbti >= 0) {
        nb.tagsArr.splice(nbti, 1)
        navColData.notebooks[nbi] = nb
      }

      // Delete tag of note
      // If the notebook is opened, just modify the pane data.
      if (listColData.sign === nb.sign) {
        for (let ici = 0; ici < listColData.list.length; ici++) {
          const item = listColData.list[ici]
          const iii = item.tagsArr.indexOf(sign)
          if (iii >= 0) {
            listColData.list[ici].tagsArr.splice(iii, 1)
          }
        }
        panesStore.setListColData(listColData)
      } else {
        // Open the notebook file, loop and delete tag of notes.
        readNotebookdata(nb.sign).then((notes) => {
          for (let ni = 0; ni < notes.length; ni++) {
            const note = notes[ni]
            const ntidx = note.tagsArr.indexOf(sign)
            if (ntidx >= 0) {
              notes[ni].tagsArr.splice(ntidx, 1)
            }
          }
          saveNotebookFileWithContent(nb.sign, genNotebookFileContent(notes))
        })
      }

      updateFileMeta('', nb.sign)
    }

    // Loop and delete tag of attachments

    // delete the data in navigationColumn
    const tag = navColData.tags[ti]
    if (tag.sign === sign) {
      navColData.tags.splice(ti, 1)
    }
  }

  panesStore.setNavigationColData(navColData)

  saveCurrentNotebookData()
  if (await saveToEntryFile() === StrSignOk) {
    return true
  } else {
    return false
  }
}

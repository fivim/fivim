import { ElMessage } from 'element-plus'

import { ErrorMessagesInfo } from '@/types'
import { StrSignOk, StrSignErr } from '@/constants'
import { getDataDirs } from '@/libs/init/dirs'
import { useAppStore } from '@/pinia/modules/app'
import { genFilePwd } from '@/libs/commands'
import { invoker } from '@/libs/commands/invoke'
import { i18n } from '@/libs/init/i18n'

import { parseNotebookJson } from './parser_decode'
import { saveNotebookFile, saveEntryFile, genNotebookFileContent, saveNotebookFileWithContent } from './parser_encode'

export const getEntryFileName = () => {
  const appStore = useAppStore()
  return appStore.data.settings.encryption.entryFileName
}

export const genCurrentNotebookFileName = () => {
  const appStore = useAppStore()
  const sign = appStore.data.listCol.sign
  const senc = appStore.data.settings.encryption
  return `${sign}${senc.fileExt}`
}

export const getNotebookFilePath = async (sign: string) => {
  const appStore = useAppStore()
  const p = await getDataDirs()
  return p.pathOfCurrentDir + sign + appStore.data.settings.encryption.fileExt
}

export const writeEncryptedUserDataToFile = (dir: string, fileName: string, content: object) => {
  if (import.meta.env.TAURI_DEBUG) {
    console.log('>>> writeEncryptedUserDataToFile content:: ', content)
  }

  return invoker.writeUserDataFile(genFilePwd(''), dir + fileName, fileName, content, '')
}

export const readNotebookdata = async (sign: string) => {
  const path = await getNotebookFilePath(sign)
  const fileData = await invoker.readUserDataFile(genFilePwd(''), path, true, 'string', '')

  if (fileData.crc32 !== fileData.crc32_check) {
    const msg = ErrorMessagesInfo.FileVerificationFailed
    invoker.logError(msg + ` >>> crc32_check: ${fileData.crc32_check}, crc32: ${fileData.crc32}`)
    // return Promise.reject(new Error(msg))
  }

  if (fileData.file_data_str.length === 0) {
    invoker.logError('>>> readNotebookdata readUserDataFile get empty content')
  }
  const jsonStr = fileData.file_data_str

  if (import.meta.env.TAURI_DEBUG) {
    console.log('>>> readNotebookdata notesData:: ', JSON.parse(jsonStr))
  }

  return parseNotebookJson(jsonStr) // call JSON.parse to get a JSON string
}

export const writeUserData = (filePath: string, fileName: string, fileContent: object) => {
  return invoker.writeUserDataFile(genFilePwd(''), filePath, fileName, fileContent, '')
}

export const addFileMeta = async (dir: string, fileName: string) => {
  const appStore = useAppStore()
  const ad = appStore.data

  const meta = await invoker.getFileMeta(dir + fileName)
  ad.userData.filesMeta.push({
    ctimeUtc: new Date(),
    mtimeUtc: new Date(0),
    dtimeUtc: new Date(0),
    sign: fileName,
    sha256: meta.sha256,
    size: meta.size
  })
  appStore.setData(ad)
}

export const updateFileMeta = async (dir: string, fileName: string) => {
  const appStore = useAppStore()
  const ad = appStore.data

  const files = ad.userData.filesMeta
  const meta = await invoker.getFileMeta(dir + fileName)
  let exist = false
  for (const item of files) {
    if (item.sign === fileName) {
      item.mtimeUtc = new Date()
      item.sha256 = meta.sha256
      item.size = meta.size
      exist = true
      break
    }
  }
  if (!exist) {
    ad.userData.filesMeta.push({
      ctimeUtc: new Date(0),
      mtimeUtc: new Date(),
      dtimeUtc: new Date(0),
      sign: fileName,
      sha256: meta.sha256,
      size: meta.size
    })
    invoker.logError(`>>> updateFileMeta can not found file info: ${fileName}, add a new info.`)
  }
  appStore.setData(ad)
}

// Only update dtimeUtc, do not delete record.
export const deleteFileMeta = async (fileName: string) => {
  const appStore = useAppStore()
  const ad = appStore.data

  for (const item of ad.userData.filesMeta) {
    if (item.sign === fileName) {
      item.dtimeUtc = new Date()
      break
    }
  }
  appStore.setData(ad)
}

const deleteFileInCurrentDir = async (fileName: string) => {
  const p = await getDataDirs()
  const filePath = p.pathOfCurrentDir + fileName
  return await invoker.deleteFile(filePath)
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
  const appStore = useAppStore()
  const t = i18n.global.t

  // Save current notebook, and record the sha256 into entry file
  return saveNotebookFile(true, '').then((saveNotebookRes) => {
    if (appStore.data.listCol.noteList.length > 0) {
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
  const appStore = useAppStore()
  const navColData = appStore.data.userData
  for (let index = 0; index < navColData.notebooks.length; index++) {
    // delete the data in paneData
    if (navColData.notebooks[index].sign === sign) {
      navColData.notebooks.splice(index, 1)
      appStore.setUserDataMapData(navColData)
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
  const appStore = useAppStore()
  const userDataMap = appStore.data.userData
  const listColData = appStore.data.listCol
  const p = await getDataDirs()

  for (let ti = 0; ti < userDataMap.tags.length; ti++) {
    // Loop and delete tag of notebooks and notes
    for (let nbi = 0; nbi < userDataMap.notebooks.length; nbi++) {
      const nb = userDataMap.notebooks[nbi]
      const nbti = nb.tagsArr.indexOf(sign)
      // Delete tag of notebook
      if (nbti >= 0) {
        nb.tagsArr.splice(nbti, 1)
        userDataMap.notebooks[nbi] = nb
      }

      // Delete tag of note
      // If the notebook is opened, just modify the pane data.
      if (listColData.sign === nb.sign) {
        for (let ici = 0; ici < listColData.noteList.length; ici++) {
          const item = listColData.noteList[ici]
          const iii = item.tagsArr.indexOf(sign)
          if (iii >= 0) {
            listColData.noteList[ici].tagsArr.splice(iii, 1)
          }
        }
        appStore.setListColData(listColData)
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

      updateFileMeta(p.pathOfCurrentDir, nb.sign)
    }

    // Loop and delete tag of attachments

    // delete the data in navigationColumn
    const tag = userDataMap.tags[ti]
    if (tag.sign === sign) {
      userDataMap.tags.splice(ti, 1)
    }
  }

  appStore.setUserDataMapData(userDataMap)

  saveCurrentNotebookData()
  if (await saveToEntryFile() === StrSignOk) {
    return true
  } else {
    return false
  }
}

import { ElMessage } from 'element-plus'
import { join as pathJoin } from '@tauri-apps/api/path'

import { MessagesInfo } from '@/types'
import { TypeString, TaskChangeMasterPassword } from '@/constants'
import { getDataDirs, getDataDirsByPwd } from '@/libs/init/dirs'
import { useAppStore } from '@/pinia/modules/app'
import { genFilePwd, CmdAdapter } from '@/libs/commands'
import { invoker } from '@/libs/commands/invoke'
import { i18n } from '@/libs/init/i18n'
import { UserFileMetaInfo } from '@/libs/user_data/types'
import { startProgressBar, pathRemoveSlash, resetProgressBarWithoutTaskName } from '@/utils/pinia_related'
import { genFormatedDate } from '@/utils/hash'
import { jsonCopy } from '@/utils/utils'

import { parseNotebookJson } from './parser_decode'
import { saveNotebookFile, saveEntryFile, genNotebookFileContent, saveNotebookFileWithContent } from './parser_encode'
import { tmplFileInfo, tmplNoteInfo } from './types_template'

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

export const getCurrentNotebookIndexInList = () => {
  const appStore = useAppStore()
  const ad = appStore.data
  const list = ad.listCol.listOfNote
  let res = -1

  for (let index = 0; index < list.length; index++) {
    const item = list[index]
    if (item.sign === ad.currentFile.subSign) {
      res = index
      break
    }
  }

  return res
}

export const getCurrentNotebookInList = (sign: string) => {
  const appStore = useAppStore()
  const ad = appStore.data
  const list = ad.listCol.listOfNote
  let res = tmplNoteInfo()

  if (sign === '') {
    sign = ad.currentFile.sign
  }

  for (let index = 0; index < list.length; index++) {
    const item = list[index]
    if (item.sign === sign) {
      res = item
      break
    }
  }

  return res
}

export const getCurrentFileInList = () => {
  const appStore = useAppStore()
  const ad = appStore.data
  const list = ad.userData.files
  let res = tmplFileInfo()

  for (let index = 0; index < list.length; index++) {
    const item = list[index]
    if (item.sign === ad.currentFile.sign) {
      res = item
      break
    }
  }

  return res
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

  return invoker.writeUserDataFile(genFilePwd(''), dir + fileName, fileName, content, '', '')
}

export const readNotebookdata = async (sign: string) => {
  const path = await getNotebookFilePath(sign)
  const fileData = await invoker.readUserDataFile(genFilePwd(''), path, true, TypeString, '', '')

  if (fileData.crc32 !== fileData.crc32_check) {
    const msg = MessagesInfo.FileVerificationFailed
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
  return invoker.writeUserDataFile(genFilePwd(''), filePath, fileName, fileContent, '', '')
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

export const updateFileMeta = async (fileName: string) => {
  const appStore = useAppStore()
  const ad = appStore.data

  let exist = false
  for (let index = 0; index < ad.userData.filesMeta.length; index++) {
    const item = ad.userData.filesMeta[index]

    if (item.sign === fileName) {
      const p = await getDataDirs()
      const meta = await invoker.getFileMeta(p.pathOfCurrentDir + fileName)

      ad.userData.filesMeta[index].mtimeUtc = new Date()
      ad.userData.filesMeta[index].sha256 = meta.sha256
      ad.userData.filesMeta[index].size = meta.size

      exist = true
      break
    }
  }
  if (!exist) {
    invoker.logError(`>>> updateFileMeta can not found file info: ${fileName}.`)
  }
  appStore.setData(ad)
  return true
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

export const getAllFilesMeta = () => {
  const appStore = useAppStore()
  const ad = appStore.data
  const allFilesArr = jsonCopy(ad.userData.filesMeta) as UserFileMetaInfo[]

  return allFilesArr
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
    const msg = t('&Failed to save file:', { fileName: getEntryFileName() })
    CmdAdapter().notification(msg, '', '')
    invoker.logError(msg)
  }

  return saveEntryFileRes
}

export const saveCurrentNotebook = async () => {
  const appStore = useAppStore()
  const t = i18n.global.t

  // Save current notebook, and record the sha256 into entry file
  return saveNotebookFile(true, '').then((saveNotebookRes) => {
    if (appStore.data.listCol.listOfNote.length > 0) {
      if (!saveNotebookRes) {
        const msg = t('&Failed to save file:', { fileName: genCurrentNotebookFileName() })
        CmdAdapter().notification(msg, '', '')
        invoker.logError(msg)
      } else {
        return true
      }
    }

    return saveToEntryFile()
  })
}

export const saveCurrentNotebookAndCreateNotebookFile = async (fileName: string) => {
  const sur = await saveCurrentNotebook()
  if (sur) {
    return saveNotebookFile(false, fileName).then((saveRes) => {
      return saveRes
    })
  }

  return sur
}

export const saveCurrentNotebookData = async (showMsg: boolean) => {
  const t = i18n.global.t
  const success = await saveCurrentNotebook()
  if (success) {
    if (showMsg) {
      ElMessage({
        message: t('Operation succeeded'),
        type: 'success'
      })
    }

    const success2 = await saveToEntryFile()
    if (success2) {
      const appStore = useAppStore()
      updateFileMeta(appStore.data.currentFile.sign)
    }

    // setTimeout(updateCurrentNotebookFileMeta, 800)
  } else {
    if (showMsg) {
      ElMessage({
        message: t('Operation failure'),
        type: 'error'
      })
    }
  }
  return success
}

export const deleteNotebook = async (sign: string) => {
  const appStore = useAppStore()
  const navColData = appStore.data.userData
  for (let index = 0; index < navColData.notebooks.length; index++) {
    // delete the data in paneData
    if (navColData.notebooks[index].sign === sign) {
      navColData.notebooks.splice(index, 1)
      appStore.setUserData(navColData)
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
  const userData = appStore.data.userData
  const listColData = appStore.data.listCol

  for (let ti = 0; ti < userData.tags.length; ti++) {
    // Loop and delete tag of notebooks and notes
    for (let nbi = 0; nbi < userData.notebooks.length; nbi++) {
      const nb = userData.notebooks[nbi]
      const nbti = nb.tagsArr.indexOf(sign)
      // Delete tag of notebook
      if (nbti >= 0) {
        nb.tagsArr.splice(nbti, 1)
        userData.notebooks[nbi] = nb
      }

      // Delete tag of note
      // If the notebook is opened, just modify the pane data.
      if (listColData.sign === nb.sign) {
        for (let ici = 0; ici < listColData.listOfNote.length; ici++) {
          const item = listColData.listOfNote[ici]
          const iii = item.tagsArr.indexOf(sign)
          if (iii >= 0) {
            listColData.listOfNote[ici].tagsArr.splice(iii, 1)
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

      updateFileMeta(nb.sign)
    }

    // Loop and delete tag of attachments

    // delete the data in navigationColumn
    const tag = userData.tags[ti]
    if (tag.sign === sign) {
      userData.tags.splice(ti, 1)
    }
  }

  appStore.setUserData(userData)

  saveCurrentNotebookData(false)

  return await saveToEntryFile()
}

export const changeMasterPassword = async (newPassWord: string, fileVerification: boolean) => {
  // DO NOT SAVE NOTEBOOK HERE, IT WILL CHANGE THE CONTENT OF THE NOTEBOOK FILE,
  // AND THE SHA256 WILL BE CHANGED.
  // saveCurrentNotebook()

  const appStore = useAppStore()
  const t = i18n.global.t
  const ad = appStore.data
  const entryFileSign = ad.settings.encryption.entryFileName

  const p = await getDataDirs()
  const pn = await getDataDirsByPwd(newPassWord)
  const dateStr = genFormatedDate('___YYYY-MM-DD_HH-mm-ss')
  const newDir = pathRemoveSlash(pn.pathOfCurrentDir)
  const newTempDir = newDir + dateStr + '_new'

  const allFilesArr = getAllFilesMeta()
  const fileCount = allFilesArr.length
  appStore.data.progress.changeMasterPassword.totalFilesCount = fileCount

  let processedCount = 0
  let lastProgressName = ''
  for (const item of allFilesArr) {
    // file has deleted
    if (new Date(item.dtimeUtc).getTime() > 0) {
      processedCount++
      continue
    }

    const sourceFilePath = p.pathOfCurrentDir + item.sign
    const outputPath = await pathJoin(newTempDir, item.sign)

    let sha256Ok = true
    let sha256 = ''
    if (fileVerification) {
      sha256 = await invoker.sha256ByFilePath(sourceFilePath)
      sha256Ok = item.sha256 === sha256
    }

    appStore.data.progress.changeMasterPassword.currentFileName = item.sign
    appStore.data.progress.changeMasterPassword.currentFileIndex = processedCount + 1
    appStore.data.progress.changeMasterPassword.currentFileSize = item.size

    if (item.sign === entryFileSign || sha256Ok) {
      const progressName = startProgressBar(TaskChangeMasterPassword, false)
      const success = await invoker.reEncryptFile(genFilePwd(''), genFilePwd(newPassWord), sourceFilePath, item.sign, outputPath, progressName)
      if (success) {
        processedCount++
      } else {
        invoker.logError('file re-encrypt error: ' + item.sign)
      }
      resetProgressBarWithoutTaskName(progressName)
      lastProgressName = progressName
    } else {
      invoker.logError(`file SHA256 does not match,\n file: ${item.sign},\n recorded sha256:${item.sha256},\n calculated sha256:${sha256}`)
    }
  }

  resetProgressBarWithoutTaskName(lastProgressName)

  const success = fileCount === processedCount
  if (success) {
    // Rename old dir
    const originalOldDir = pathRemoveSlash(p.pathOfCurrentDir)
    const backupDir = originalOldDir + dateStr + '_backup'
    const successOldDir = await invoker.rename(originalOldDir, backupDir)
    if (!successOldDir) {
      const msg = t('&Failed to rename: {name}', { name: originalOldDir })
      CmdAdapter().notification(msg, '', '')
      invoker.logError(msg)
    }

    // Rename new dir
    const successNewDir = await invoker.rename(newTempDir, newDir)
    if (successNewDir) {
      appStore.data.progress.currentTask.isSuccess = true
      appStore.data.progress.currentTask.message = backupDir
    } else {
      const msg = t('&Failed to rename: {name}', { name: newTempDir })
      CmdAdapter().notification(msg, '', '')
      invoker.logError(msg)
    }
  } else {
    const msg = t('&Please check the log: {path}', { path: appStore.data.dataPath.pathOfLogFile })
    appStore.data.progress.currentTask.message = msg
    appStore.data.progress.currentTask.isFailure = true
  }
  return success
}

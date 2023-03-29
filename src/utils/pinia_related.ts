import { DefaultFileNameRule, TypeNote, TypeFile } from '@/constants'
import { useAppStore } from '@/pinia/modules/app'
import { invoker } from '@/libs/commands/invoke'
import { tmplTagInfo } from '@/libs/user_data/types_templates'
import { TagInfo } from '@/libs/user_data/types'
import { genFileNameByTime } from '@/utils/hash'
import { formatDateTime } from '@/utils/string'
import { tmplAppData } from '@/types_template'
import { AppInfo } from '@/types'

import { jsonCopy } from './utils'
import { round } from './number'

export const genFileName = () => {
  const appStore = useAppStore()
  const settings = appStore.data.settings
  return genFileNameByTime(settings.encryption.fileNameRule || DefaultFileNameRule, settings.appearance.dateTimeFormat, settings.encryption.fileExt)
}

export const getTagData = (sign: string): TagInfo => {
  const appStore = useAppStore()
  let res: TagInfo = jsonCopy(tmplTagInfo)
  const tagsArr = appStore.data.userData.tags
  if (tagsArr) {
    for (const i of tagsArr) {
      if (i.sign === sign) {
        res = i
        break
      }
    }
  }

  return res
}

export const getFileNameFromPath = (path: string) => {
  const appStore = useAppStore()
  const separator = appStore.data.dataPath.separator
  const arr = path.split(separator)
  return arr.pop() || ''
}

export const formatTime = (time: Date) => {
  const appStore = useAppStore()
  return formatDateTime(time, appStore.data.settings.appearance.dateTimeFormat)
}

export const restEditorCol = () => {
  const appStore = useAppStore()
  const data = appStore.data

  const defaultData = jsonCopy(tmplAppData) as AppInfo
  data.currentFile = defaultData.currentFile

  appStore.setData(data)
}

export const pathJoin = async (dirs: string[]) => {
  const appStore = useAppStore()
  const separator = appStore.data.dataPath.separator
  return dirs.join(separator)
}

export const isNote = () => {
  const appStore = useAppStore()
  return appStore.data.currentFile.type === TypeNote
}

export const isFile = () => {
  const appStore = useAppStore()
  return appStore.data.currentFile.type === TypeFile
}

export const listenProgressStatus = (progressName: string, taskName: string) => {
  const appStore = useAppStore()
  appStore.data.currentProgress.taskName = taskName
  const itmerProgress = setInterval(async () => {
    invoker.getProgress(progressName).then((data) => {
      const pct = data.percentage * 100
      const ad = appStore.data
      ad.currentProgress.percent = pct

      if (round(pct) >= 100) {
        clearInterval(itmerProgress)
        ad.currentProgress.percent = 0
      }
      appStore.setData(ad)
    })
  }, 500)
}

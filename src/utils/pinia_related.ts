import { DefaultFileNameRule, TypeNote, TypeFile, TypeNone } from '@/constants'
import { useAppStore } from '@/pinia/modules/app'
import { invoker } from '@/libs/commands/invoke'
import { tmplTagInfo } from '@/libs/user_data/types_template'
import { TagInfo } from '@/libs/user_data/types'
import { genFileNameByTime, genUuidv4 } from '@/utils/hash'
import { formatDateTime } from '@/utils/string'
import { tmplAppData } from '@/types_template'
import { AppInfo, TypeTask } from '@/types'
import { StringNumberObj } from '@/types_common'

import { round } from './number'

export const genFileName = () => {
  const appStore = useAppStore()
  const settings = appStore.data.settings
  return genFileNameByTime(settings.encryption.fileNameRule || DefaultFileNameRule, settings.appearance.dateTimeFormat, settings.encryption.fileExt)
}

export const getTagData = (sign: string): TagInfo => {
  const appStore = useAppStore()
  let res: TagInfo = tmplTagInfo()
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

  const defaultData = tmplAppData() as AppInfo
  data.currentFile = defaultData.currentFile

  appStore.setData(data)
}

export const pathRemoveSlash = (dir: string) => {
  const appStore = useAppStore()
  const separator = appStore.data.dataPath.separator
  if (dir.endsWith(separator)) {
    dir = dir.slice(0, 0 - separator.length)
  }
  return dir
}

export const isNote = () => {
  const appStore = useAppStore()
  return appStore.data.currentFile.type === TypeNote
}

export const isFile = () => {
  const appStore = useAppStore()
  return appStore.data.currentFile.type === TypeFile
}

const progressBarTimerMap: StringNumberObj = {}

export const startProgressBar = (taskName: TypeTask, autoResetTaskName: boolean) => {
  const progressName = genUuidv4()
  const appStore = useAppStore()
  appStore.data.progress.currentTask.taskName = taskName

  const itmer = setInterval(async () => {
    invoker.getProgress(progressName).then((data) => {
      const pct = round(data.percentage * 100)
      const ad = appStore.data
      ad.progress.currentTask.percent = pct

      if (pct >= 100) {
        if (autoResetTaskName) {
          resetProgressBar(progressName)
        } else {
          ad.progress.currentTask.percent = 0
          clearInterval(progressBarTimerMap[taskName])
        }
      }
      appStore.setData(ad)
    })
  }, 500)

  progressBarTimerMap[progressName] = itmer as unknown as number

  return progressName
}

export const resetProgressBar = (progressName: string) => {
  const appStore = useAppStore()
  appStore.data.progress.currentTask.percent = 0
  appStore.data.progress.currentTask.taskName = TypeNone
  clearInterval(progressBarTimerMap[progressName])
}

export const resetProgressBarWithoutTaskName = (progressName: string) => {
  const appStore = useAppStore()
  appStore.data.progress.currentTask.percent = 0
  clearInterval(progressBarTimerMap[progressName])
}

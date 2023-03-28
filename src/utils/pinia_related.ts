import { DefaultFileNameRule, TypeNone } from '@/constants'
import { useAppStore } from '@/pinia/modules/app'
import { TagInfo } from '@/libs/user_data/types'
import { tmplTagInfo } from '@/libs/user_data/types_templates'
import { genFileNameByTime } from '@/utils/hash'
import { formatDateTime } from '@/utils/string'

import { jsonCopy } from './utils'

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
  const pde = appStore.data.currentFile
  pde.type = TypeNone
  pde.sign = ''

  appStore.setCurrentFile(pde)
}

export const pathJoin = async (dirs: string[]) => {
  const appStore = useAppStore()
  const separator = appStore.data.dataPath.separator
  return dirs.join(separator)
}

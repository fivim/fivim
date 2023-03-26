import { DefaultFileNameRule, TypeNone } from '@/constants'
import { usePanesStore } from '@/pinia/modules/panes'
import { useAppStore } from '@/pinia/modules/app'
import { useSettingStore } from '@/pinia/modules/settings'
import { TagInfo } from '@/libs/user_data/types'
import { tmplTagInfo } from '@/libs/user_data/types_templates'
import { genFileNameByTime } from '@/utils/hash'
import { formatDateTime } from '@/utils/string'

import { jsonCopy } from './utils'

export const genFileName = () => {
  const settingStore = useSettingStore()
  const settings = settingStore.data
  return genFileNameByTime(settings.encryption.fileNameRule || DefaultFileNameRule, settings.appearance.dateTimeFormat, settings.encryption.fileExt)
}

export const getTagData = (sign: string): TagInfo => {
  const panesStore = usePanesStore()
  let res: TagInfo = jsonCopy(tmplTagInfo)
  const tagsArr = panesStore.data.navigationCol.tags
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
  const settingStore = useSettingStore()
  return formatDateTime(time, settingStore.data.appearance.dateTimeFormat)
}

export const restEditorCol = () => {
  const panesStore = usePanesStore()
  const pde = panesStore.data.editorCol
  pde.type = TypeNone
  pde.sign = ''

  panesStore.setEditorColData(pde)
}

export const pathJoin = async (dirs: string[]) => {
  const appStore = useAppStore()
  const separator = appStore.data.dataPath.separator
  return dirs.join(separator)
}

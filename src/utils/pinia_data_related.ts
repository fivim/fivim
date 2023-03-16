import { DefaultFileNameRule } from '@/constants'
import { useSettingStore } from '@/pinia/modules/settings'
import { genTimeHashedSign } from '@/utils/hash'

export const getHasdedSign = () => {
  const settingStore = useSettingStore()
  const settingData = settingStore.data
  return genTimeHashedSign(settingData.encryption.fileNameRule || DefaultFileNameRule, settingData.appearance.dateTimeFormat, settingData.encryption.fileExt)
}

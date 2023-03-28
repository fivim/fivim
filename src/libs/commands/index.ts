import { MasterPasswordSalt } from '@/constants'
import { useAppStore } from '@/pinia/modules/app'
import { runInTauri, genFilePwdWithSalt } from '@/utils/utils'

import { Commands } from './types'
import { CommandsTauri } from './command_tauri'
import { CommandsWeb } from './command_web'

let adapter: Commands | null = null
export const CmdAdapter = (): Commands => {
  if (adapter === null) {
    if (runInTauri()) {
      adapter = new CommandsTauri()
    } else {
      adapter = new CommandsWeb()
    }
  }

  return adapter
}

// If you want to share the file with friends or receive files from friends,
// you don't need to pass the password parameter.
export const genFilePwd = (pwd: string) => {
  if (pwd) {
    return genFilePwdWithSalt(pwd, '')
  } else {
    const appStore = useAppStore()
    return genFilePwdWithSalt(appStore.data.settings.encryption.masterPassword, MasterPasswordSalt)
  }
}

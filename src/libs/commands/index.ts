import { MasterPasswordSalt } from '@/constants'
import { useAppStore } from '@/pinia/modules/app'
import { runInTauri, genFilePwdWithSalt } from '@/utils/utils'

import { Commands } from './types'
import { CommandsTauri } from './command_tauri'
import { CommandsWeb } from './command_web'

let adapter: Commands = new CommandsTauri()
if (!runInTauri()) {
  adapter = new CommandsWeb()
}

export const CmdAdapter = () => {
  return adapter
}

// If you want to share the file with friends or receive files from friends,
// you don't need to pass the password parameter.
export const genFilePwd = (pwd: string) => {
  if (!pwd) {
    const appStore = useAppStore()
    pwd = appStore.data.settings.encryption.masterPassword
  }

  return genFilePwdWithSalt(pwd, MasterPasswordSalt)
}

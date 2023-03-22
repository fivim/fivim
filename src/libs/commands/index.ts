import { AppCoreConf } from '@/types'
import { runInTauri } from '@/utils/utils'

import { Commands, WriteFileRes, UserDataFile } from './types'
import { CommandsTauri } from './command_tauri'
import { CommandsWeb } from './command_web'

export type SyncListResItemLocalDisk = {
  file_name: string,
  is_dir: boolean,
  modified_time_stamp: number
}

export let CmdAdapter: Commands

export const InitCommandsAdapter = () => {
  if (runInTauri()) {
    CmdAdapter = new CommandsTauri()
  } else {
    CmdAdapter = new CommandsWeb()
  }
}

// Call tauri commands. Consistent with the rust code
// Unify the parameter naming and type of the invoke function.
export const CmdInvoke = {
  // ---------- single functions ----------
  // core
  closeSplashscreen: () =>
    CmdAdapter.invoke('close_splashscreen', {}) as Promise<boolean>,
  getAppCoreConf: () =>
    CmdAdapter.invoke('get_app_core_conf', {}) as Promise<AppCoreConf>,
  getDictJson: () =>
    CmdAdapter.invoke('get_dict_json', {}) as Promise<string>,
  getLocale: () =>
    CmdAdapter.invoke('get_locale', {}) as Promise<string>,
  setLocale: (locale: string) =>
    CmdAdapter.invoke('set_locale', { locale }) as Promise<boolean>,
  systemTrayUpdateText: () =>
    CmdAdapter.invoke('system_tray_update_text', {}) as Promise<boolean>,

  // file and dir
  copyFile: (filePath: string, targetFilePath: string) =>
    CmdAdapter.invoke('copy_file', { filePath, targetFilePath }) as Promise<boolean>,
  deleteFile: (filePath: string) =>
    CmdAdapter.invoke('delete_file', { filePath }) as Promise<boolean>,
  existFile: (filePath: string) =>
    CmdAdapter.invoke('exist_file', { filePath }) as Promise<boolean>,
  getFileBytes: (filePath: string) =>
    CmdAdapter.invoke('get_file_bytes', { filePath }) as Promise<Uint8Array>,
  readFileToBytes: (filePath: string) =>
    CmdAdapter.invoke('read_file_to_bytes', { filePath }) as Promise<Uint8Array>,
  readFileToString: (filePath: string) =>
    CmdAdapter.invoke('read_file_to_string', { filePath }) as Promise<string>,
  sha256ByFilePath: (filePath: string) =>
    CmdAdapter.invoke('sha256_by_file_path', { filePath }) as Promise<string>,
  writeBase64IntoFile: (filePath: string, fileContentBase64: string) =>
    CmdAdapter.invoke('write_base64_into_file', { filePath, fileContentBase64 }) as Promise<WriteFileRes>,
  writeStringIntoFile: (filePath: string, fileContent: string) =>
    CmdAdapter.invoke('write_string_into_file', { filePath, fileContent }) as Promise<WriteFileRes>,
  writeBytesIntoFile: (filePath: string, fileContent: Uint8Array) =>
    CmdAdapter.invoke('write_bytes_into_file', { filePath, fileContent: Array.from(fileContent) }) as Promise<WriteFileRes>,

  // dir
  deleteDir: (dirPath: string) =>
    CmdAdapter.invoke('delete_dir', { dirPath }) as Promise<boolean>,
  getDirSize: (dirPath: string) =>
    CmdAdapter.invoke('get_dir_size', { dirPath }) as Promise<number>,
  listDirChildren: (dirPath: string) =>
    CmdAdapter.invoke('list_dir_children', { dirPath }) as Promise<SyncListResItemLocalDisk[]>,

  // log
  logInfo: (content: string) => {
    console.log('>>> log info::', content)
    CmdAdapter.invoke('log', { level: 'INFO', content })
  },
  logError: (content: string) => {
    console.log('>>> log error::', content)
    CmdAdapter.invoke('log', { level: 'ERROR', content })
  },
  logDebug: (content: string) => {
    console.log('>>> log debug::', content)
    CmdAdapter.invoke('log', { level: 'DEBUG', content })
  },

  // other
  notification: (title: string, body: string, icon: string) =>
    CmdAdapter.notification(title, body, icon) as Promise<void>,

  // encrypt
  // decryptFile: (pwd: string, sourcePath: string, distPath: string) =>
  //   CmdAdapter.invoke('decrypt_file', { pwd, sourcePath, distPath }) as Promise<boolean>,
  decryptString: (pwd: string, content: Uint8Array) =>
    CmdAdapter.invoke('decrypt_string', { pwd, content }) as Promise<string>,
  // encryptFile: (pwd: string, sourcePath: string, distPath: string) =>
  //   CmdAdapter.invoke('encrypt_file', { pwd, sourcePath, distPath }) as Promise<boolean>,
  encryptString: (pwd: string, content: string) =>
    CmdAdapter.invoke('encrypt_string', { pwd, content }) as Promise<Uint8Array>,
  stringCrc32: (str: string) =>
    CmdAdapter.invoke('string_crc32', { string: str }) as Promise<number>,

  // user data file
  readUserDataFile: (pwd: string, filePath: string, parseAsString: boolean) =>
    CmdAdapter.invoke('read_user_data_file', { pwd, filePath, parseAsString }) as Promise<UserDataFile>,
  writeUserDataFile: (pwd: string, filePath: string, fileName: string, fileContent: Uint8Array, sourceOfLargeFilePath: string) =>
    CmdAdapter.invoke('write_user_data_file', { pwd, filePath, fileName, fileContent: Array.from(fileContent), sourceOfLargeFilePath }) as Promise<boolean>,

  // ---------- combined functions ----------
  // encrypt
  encryptStringToFile: (pwd: string, filePath: string, fileContent: string) => {
    return CmdInvoke.encryptString(pwd, fileContent).then(async (u8Arr: Uint8Array) => {
      return await CmdInvoke.writeBytesIntoFile(filePath, u8Arr)
    }) as Promise<WriteFileRes>
  },
  decryptFileToString: (pwd: string, filePath: string) => {
    return CmdInvoke.readFileToBytes(filePath).then(async (u8Arr: Uint8Array) => {
      return await CmdInvoke.decryptString(pwd, u8Arr)
    }) as Promise<string>
  }
}

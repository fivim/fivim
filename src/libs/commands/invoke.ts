//
// The code in this file can be run independently of other code in the project.
//

import { invoke } from '@tauri-apps/api/tauri'

import { AppCoreConfInfo } from '@/types'
import { stringToUint8Array } from '@/utils/string'

import { WriteFileRes, UserDataFile, UserDataParseAs, FileMeta, ProgressStatus } from './types'

export type SyncListResItemLocalDisk = {
  file_name: string,
  is_dir: boolean,
  modified_time_stamp: number
}

// Call tauri commands. Consistent with the rust code
// Unify the parameter naming and type of the invoke function.
export const invoker = {
  // ---------- single functions ----------
  // core
  closeSplashscreen: () =>
    invoke('close_splashscreen', {}) as Promise<boolean>,
  getAppCoreConf: () =>
    invoke('get_app_core_conf', {}) as Promise<AppCoreConfInfo>,
  getDictJson: () =>
    invoke('get_dict_json', {}) as Promise<string>,
  getLocale: () =>
    invoke('get_locale', {}) as Promise<string>,
  setLocale: (locale: string) =>
    invoke('set_locale', { locale }) as Promise<boolean>,
  systemTrayUpdateText: () =>
    invoke('system_tray_update_text', {}) as Promise<boolean>,

  // file
  copyFile: (filePath: string, targetFilePath: string) =>
    invoke('copy_file', { filePath, targetFilePath }) as Promise<boolean>,
  deleteFile: (filePath: string) =>
    invoke('delete_file', { filePath }) as Promise<boolean>,
  existFile: (filePath: string) =>
    invoke('exist_file', { filePath }) as Promise<boolean>,
  getFileBytes: (filePath: string) =>
    invoke('get_file_bytes', { filePath }) as Promise<Uint8Array>,
  getFileMeta: (filePath: string) =>
    invoke('get_file_meta', { filePath }) as Promise<FileMeta>,
  readFileToBytes: (filePath: string) =>
    invoke('read_file_to_bytes', { filePath }) as Promise<Uint8Array>,
  readFileToString: (filePath: string) =>
    invoke('read_file_to_string', { filePath }) as Promise<string>,
  sha256ByFilePath: (filePath: string) =>
    invoke('sha256_by_file_path', { filePath }) as Promise<string>,
  writeBase64IntoFile: (filePath: string, fileContentBase64: string) =>
    invoke('write_base64_into_file', { filePath, fileContentBase64 }) as Promise<WriteFileRes>,
  writeStringIntoFile: (filePath: string, fileContent: string) =>
    invoke('write_string_into_file', { filePath, fileContent }) as Promise<WriteFileRes>,
  writeBytesIntoFile: (filePath: string, fileContent: Uint8Array) =>
    invoke('write_bytes_into_file', { filePath, fileContent: Array.from(fileContent) }) as Promise<WriteFileRes>,

  // dir
  deleteDir: (dirPath: string) =>
    invoke('delete_dir', { dirPath }) as Promise<boolean>,
  getDirSize: (dirPath: string) =>
    invoke('get_dir_size', { dirPath }) as Promise<number>,
  listDirChildren: (dirPath: string) =>
    invoke('list_dir_children', { dirPath }) as Promise<SyncListResItemLocalDisk[]>,

  // rename
  rename: (pathOld: string, pathNew: string) =>
    invoke('rename', { pathOld, pathNew }) as Promise<boolean>,

  // log
  logInfo: (content: string) => {
    console.log('>>> log info::', content)
    invoke('log', { level: 'INFO', content })
  },
  logError: (content: string) => {
    console.log('>>> log error::', content)
    invoke('log', { level: 'ERROR', content })
  },
  logDebug: (content: string) => {
    console.log('>>> log debug::', content)
    invoke('log', { level: 'DEBUG', content })
  },

  // encrypt
  decryptString: (pwd: string, content: Uint8Array) =>
    invoke('decrypt_string', { pwd, content }) as Promise<string>,
  encryptString: (pwd: string, content: string) =>
    invoke('encrypt_string', { pwd, content }) as Promise<Uint8Array>,
  stringCrc32: (str: string) =>
    invoke('string_crc32', { string: str }) as Promise<number>,

  // user data file
  // In the following read/write user data funcfions,
  // param pwd should call genFilePwd(in src/libs/commands/index.ts) first.
  readUserDataFile: (pwd: string, filePath: string, alwaysOpenInMemory: boolean, parseAs: UserDataParseAs, targetFilePath: string, progressName: string) => {
    return invoke('read_user_data_file', { pwd, filePath, alwaysOpenInMemory, parseAs, targetFilePath, progressName }) as Promise<UserDataFile>
  },
  writeUserDataFile: (pwd: string, filePath: string, fileName: string, content: object, sourceOfLargeFilePath: string, progressName: string) => {
    const fileContent = Array.from(stringToUint8Array(JSON.stringify(content)))
    return invoke('write_user_data_file', { pwd, filePath, fileName, fileContent, sourceOfLargeFilePath, progressName }) as Promise<boolean>
  },
  reEncryptFile: (pwd: string, pwdNew: string, filePath: string, fileName: string, targetFilePath: string, progressName: string) =>
    invoke('re_encrypt_file', { pwd, pwdNew, filePath, fileName, targetFilePath, progressName }) as Promise<number>,

  // other
  downloadFile: (url: string, filePath: string) =>
    invoke('download_file', { url, filePath }) as Promise<ProgressStatus>,
  getProgress: (progressName: string) =>
    invoke('get_progress', { progressName }) as Promise<ProgressStatus>,

  // ---------- combined functions ----------
  // encrypt
  encryptObjectToFile: (pwd: string, filePath: string, fileContent: object) => {
    return invoker.encryptString(pwd, JSON.stringify(fileContent)).then(async (u8Arr: Uint8Array) => {
      return await invoker.writeBytesIntoFile(filePath, u8Arr)
    }) as Promise<WriteFileRes>
  },
  decryptFileToString: (pwd: string, filePath: string) => {
    return invoker.readFileToBytes(filePath).then(async (u8Arr: Uint8Array) => {
      return await invoker.decryptString(pwd, u8Arr)
    }) as Promise<string>
  }
}

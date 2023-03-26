import { AppInfo, AppMode, Setting } from '@/types'
import { TypeNote } from '@/constants'

import { EntryFileSource } from '@/libs/user_data/types'

export const tmplAppData: AppInfo = {
  appMode: AppMode.Empty,
  appName: '',
  changeLocaleTimestamp: 0,
  changeMasterPasswordStatus: {
    action: '',
    percent: 0,

    currentNumber: 0,
    totalNumber: 0
  },
  currentFile: {
    sign: '',
    indexInList: 0,
    name: '',
    type: TypeNote
  },
  currentTheme: '',
  dataPath: {
    separator: '/',
    pathOfHome: '',
    pathOfHomeAppData: ''
  },
  defaultLocale: '',
  defaultLocaleInNative: '',
  editorFullScreen: false,
  existConfigFile: false,
  isWebPage: true,
  lockscreen: true,
  textDirection: 'LTR',
  version: ''
}

export const tmplSettingData: Setting = {
  normal: {
    showFileSavingStatus: true,
    spellCheck: false,
    workDir: ''
  },
  appearance: {
    dateTimeFormat: '',
    theme: '',
    locale: '',
    listColSortBy: 'title',
    listColSortOrder: 'ASC',
    listColShowCreateTime: true,
    listColShowUpdateTime: true
  },
  encryption: {
    masterPassword: '',
    enableFileCompress: true,
    entryFileName: '',
    fileExt: '',
    fileNameRule: 'formattedTimeSha256',
    syncLockFileName: ''
  }
}

export const tmplEntryFileData: EntryFileSource = {
  dataVersion: 0,
  noteBooks: {
    attrsArr: [],
    dataArr: []
  },
  tags: {
    attrsArr: [],
    dataArr: []
  },
  files: {
    attrsArr: [],
    dataArr: []
  },
  syncLockFileName: ''
}

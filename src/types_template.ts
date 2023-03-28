import { AppInfo, AppModeInfo, SettingInfo } from '@/types'
import { TypeNote } from '@/constants'

import { EntryFileSourceInfo, UserDataInfo } from '@/libs/user_data/types'

export const tmplUserDataMap: UserDataInfo = {
  files: [],
  notebooks: [],
  tags: [],
  filesMeta: []
}

export const tmplSetting: SettingInfo = {
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

export const tmplAppData: AppInfo = {
  appMode: AppModeInfo.Empty,
  appName: '',
  changeLocaleTimestamp: 0,
  changeMasterPasswordStatus: {
    action: '',
    percent: 0,

    currentNumber: 0,
    totalNumber: 0
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
  version: '',
  userData: tmplUserDataMap,
  listCol: {
    sign: '',
    icon: '',
    noteList: [],
    title: '',
    type: TypeNote,
    tagsArr: []
  },
  currentFile: {
    content: '',
    sign: '',
    title: '',
    type: TypeNote,
    tagsArr: [],
    indexInList: 0
  },
  settings: tmplSetting
}

export const tmplEntryFileData: EntryFileSourceInfo = {
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
  userDataFilesMeta: {
    attrsArr: [],
    dataArr: []
  },
  syncLockFileName: ''
}

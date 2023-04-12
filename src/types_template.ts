import { AppInfo, AppModeInfo, SettingInfo, SettingOfStartUpInfo, ProgressInfo, ExtDataPathInfo } from '@/types'
import { TypeNote, TypeNone } from '@/constants'

import { UserDataInfo } from '@/libs/user_data/types'

export const tmplExtDataPathInfo = (): ExtDataPathInfo => {
  return {
    pathOfHome: '',
    pathOfHomeAppData: '',
    pathOfConfig: '',
    pathOfConfigStartUp: '',
    pathOfChangeMasterPasswordDir: '',
    pathOfCurrentDir: '',
    pathOfSyncDir: '',
    pathOfSyncCachedDir: '',
    pathOfSyncDownloadDir: '',
    // style
    pathOfCustomStyle: '',
    pathOfCustomBackgroundImage: ''
  }
}

export const tmplUserDataMap = (): UserDataInfo => {
  return {
    files: [],
    notebooks: [],
    tags: [],
    filesMeta: []
  }
}

export const tmplProgress = (): ProgressInfo => {
  return {
    currentTask: {
      percent: 0,
      taskName: TypeNone,
      isFailure: false,
      isSuccess: false,
      message: ''
    },
    changeMasterPassword: {
      totalFilesCount: 0,
      currentFileIndex: 0,
      currentFileName: '',
      currentFileSize: 0
    }
  }
}

export const tmplSetting = (): SettingInfo => {
  return {
    normal: {
      showFileSavingStatus: true,
      spellCheck: false,
      workDir: '',
      locale: ''
    },
    appearance: {
      dateTimeFormat: '',
      theme: '',
      customBackagroundImg: '',
      customBackagroundOpacity: 0.8,
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
      lockFileName: ''
    },
    startupTask: {
      percent: 0,
      taskName: TypeNone,
      isFailure: false,
      isSuccess: false,
      message: ''
    }
  }
}

export const tmplSettinggStartup = (): SettingOfStartUpInfo => {
  return {
    normal: {
      locale: ''
    },
    appearance: {
      theme: ''
    }
  }
}
export const tmplAppData = (): AppInfo => {
  return {
    appMode: AppModeInfo.Empty,
    appName: '',
    appRepo: '',
    changeLocaleTimestamp: 0,
    progress: tmplProgress(),
    currentTheme: '',
    dataPath: {
      separator: '/',
      pathOfHome: '',
      pathOfHomeAppData: '',
      pathOfLogFile: ''
    },
    defaultLocale: '',
    defaultLocaleInNative: '',
    editorFullScreen: false,
    existConfigFile: false,
    isWebPage: true,
    lockscreen: true,
    textDirection: 'LTR',
    version: '',
    userData: tmplUserDataMap(),
    listCol: {
      sign: '',
      icon: '',
      listOfNote: [],
      listOfTag: [],
      title: '',
      type: TypeNote,
      tagsArr: []
    },
    navCol: {
      sign: ''
    },
    currentFile: {
      content: '',
      sign: '',
      subSign: '',
      title: '',
      type: TypeNote,
      tagsArr: []
    },
    settings: tmplSetting()
  }
}

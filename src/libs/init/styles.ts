import { AppMode } from '@/types'
import { useAppStore } from '@/pinia/modules/app'
import { useSettingStore } from '@/pinia/modules/settings'

const showTitleBar = (): boolean => {
  const appStore = useAppStore()
  const appInfo = appStore.data

  if (appInfo.appMode === AppMode.Desktop && !appInfo.isWebPage) {
    return true
  }
  return false
}

const insertStyleSheet = (style: string) => {
  const sheet = document.styleSheets[0]
  // If got error in console: "Cannot access rules at CSSStyleSheet.invokeGetter ..."
  // check the first style elemeent of HTML(Including link rel="stylesheet")
  // has any cross-domain issues.

  sheet.insertRule(style, sheet.cssRules.length)
}

export const initStyle = () => {
  const settingStore = useSettingStore()

  if (!showTitleBar()) {
    insertStyleSheet(`
      #desktop-title-bar { 
          display: none !important; 
      }`)
    insertStyleSheet(`
      .app-main { 
          height: 100vh !important; 
      }`)
  } else {
    insertStyleSheet(`
      body {
          padding-top: var(--enas-desktop-title-bar-height); 
      }`)
    insertStyleSheet(`
      .app-main { 
          height: calc(100vh - var(--enas-desktop-title-bar-height) - 2px) !important;
          //min-height: calc(100vh - var(--enas-desktop-title-bar-height) - 2px) !important; 
      }`)
  }

  const customBackagroundImg = settingStore.data.appearance.customBackagroundImg
  if (customBackagroundImg) {
    insertStyleSheet(`
      html { 
          background-image: url("${customBackagroundImg}")!important; 
          background-size: cover;
      }`)
  }
}

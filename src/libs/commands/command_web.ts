
export class CommandsWeb {
  notification = async (title: string, body: string, icon: string): Promise<void> => {
    console.log('CommandsWeb.notification NOT IMPLEMENTED')
  }

  getPlatformName = async () => {
    return 'CommandsWeb.getPlatformName NOT IMPLEMENTED'
  }

  getAppVersion = async () => {
    return 'CommandsWeb.getAppVersion NOT IMPLEMENTED'
  }

  getAppName = async () => {
    return 'CommandsWeb.getAppName NOT IMPLEMENTED '
  }

  isAndroid = async () => {
    return navigator.userAgent.toLowerCase().includes('android')
  }

  isIos = async () => {
    // Refer: https://stackoverflow.com/questions/9038625/detect-if-device-is-ios/9039885#9039885
    return (/iPad|iPhone|iPod/.test(navigator.userAgent) && !Object.prototype.hasOwnProperty.call(window, 'MSStream')) ||
      (navigator.userAgent.includes('Mac') && 'ontouchend' in document && navigator.maxTouchPoints > 1)
  }

  isMacOs = async () => {
    // Refer: https://stackoverflow.com/questions/10527983/best-way-to-detect-mac-os-x-or-windows-computers-with-javascript-or-jquery
    return navigator.platform.toUpperCase().indexOf('MAC') >= 0
  }

  isUnixLike = async () => {
    console.log('CommandsWeb.isUnixLike NOT IMPLEMENTED ')
    return false
  }

  isWindows = async () => {
    console.log('CommandsWeb.isWindows NOT IMPLEMENTED ')
    return false
  }
}

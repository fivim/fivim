import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/api/notification'
import { platform } from '@tauri-apps/api/os'
import { getVersion, getName } from '@tauri-apps/api/app'

export class CommandsTauri {
  notification = async (title: string, body: string, icon: string): Promise<void> => {
    let permissionGranted = await isPermissionGranted()
    if (!permissionGranted) {
      const permission = await requestPermission()
      permissionGranted = permission === 'granted'
    }
    if (permissionGranted) {
      sendNotification({ title, body, icon })
    }
  }

  getPlatformName = async () => {
    return await platform()
  }

  getAppVersion = async () => {
    return await getVersion()
  }

  getAppName = async () => {
    return await getName()
  }

  isAndroid = async () => {
    const platformName = await platform()
    return platformName === 'android'
  }

  isIos = async () => {
    const platformName = await platform()
    return platformName === 'ios'
  }

  isMacOs = async () => {
    const platformName = await platform()
    return platformName === 'darwin'
  }

  isUnixLike = async () => {
    const platformName = await platform()
    return ['linux', 'freebsd', 'dragonfly', 'netbsd', 'openbsd', 'solaris'].indexOf(platformName as string) >= 0
  }

  isWindows = async () => {
    const platformName = await platform()
    return platformName === 'win32'
  }
}

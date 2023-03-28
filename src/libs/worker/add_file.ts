/**
 * invoke tauri command willcause error: "ReferenceError: window is not defined"
 *
 * Refer: https://github.com/tauri-apps/tauri/issues/3308#issuecomment-1025132141
 */

import { invoke } from '@tauri-apps/api/tauri'

export { }

onmessage = function (event: MessageEvent<any>) {
  console.log('>>> worker event ::', event)

  invoke('get_locale', {}).then((aaa) => {
    console.log('>>> aaa ::', aaa)
  })

  self.postMessage('$$$')
}

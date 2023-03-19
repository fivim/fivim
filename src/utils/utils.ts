// deep copy a data
export const jsonCopy = (data: any) => JSON.parse(JSON.stringify(data))

// Refer: https://davidwalsh.name/javascript-debounce-function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce(this: any, func: any, wait: number, immediate = false) {
  let timeout: number | undefined
  return () => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this
    // eslint-disable-next-line prefer-rest-params
    const args = arguments
    const later = function () {
      timeout = undefined
      if (!immediate) {
        func.apply(context, args)
      }
    }
    const callNow = immediate && !timeout
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
    if (callNow) {
      func.apply(context, args)
    }
  }
}

export const runInTauri = () => {
  return Object.prototype.hasOwnProperty.call(window, '__TAURI__')
}

export const disableRightCilckAndDevTool = () => {
  // disable right click
  window.oncontextmenu = function (e) { e.preventDefault() }
  // disable develop tool
  window.onkeydown = function (e) {
    if (e.keyCode === 123) {
      e.preventDefault()
    }
  }
}

export const addJsScript = (src: string) => {
  const script = document.createElement('script')
  script.type = 'text/javascript'
  script.src = src
  document.body.appendChild(script)
}

export const addCssStyle = (src: string) => {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.type = 'text/css'
  link.href = src
  document.body.appendChild(link)
}

export const setTheme = (themeName: string) => {
  document.documentElement.setAttribute('theme', themeName)
}
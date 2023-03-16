/**
 * get OS locale, and use our existing translations.
 * @date 2023-01-18
 * @returns {string}
 */
export const getOsLocale = (defaultLocale: string): string => {
  const locale = navigator.language
  let res = ''

  // Arabic
  if (locale.indexOf('ar') >= 0) {
    res = 'ar'
  }

  // Chinese(Simplified)
  if (['zh-CN', 'zh-SG'].indexOf(locale as string) >= 0) {
    res = 'zh-CHS'
  }

  // Chinese(Traditional)
  if (['zh-HK', 'zh-MO', 'zh-TW'].indexOf(locale as string) >= 0) {
    res = 'zh-CHT'
  }

  // English
  if (locale.indexOf('en') >= 0) {
    res = 'en'
  }

  // French
  if (locale.indexOf('fr') >= 0) {
    res = 'fr'
  }

  // German
  if (locale.indexOf('de') >= 0) {
    res = 'de-DE'
  }

  // Malay
  if (locale.indexOf('ms') >= 0) {
    res = 'ms'
  }

  // Portuguese
  if (locale.indexOf('pt') >= 0) {
    res = 'pt'
  }

  // Spanish
  if (locale.indexOf('es') >= 0) {
    res = 'es'
  }

  // Urdu
  if (locale.indexOf('ur') >= 0) {
    res = 'ur'
  }

  if (res === '') {
    res = defaultLocale
  }

  return res
}

/**
 * Get available locale
 * @date 2023-01-18
 * @param {any} availableLocalesArr - available locales array
 * @param {any} defaultLocale - default locale
 * @returns {string}
 */
export const getAvailableLocale = (availableLocalesArr: string[], defaultLocale: string): string => {
  const osLocale = getOsLocale(defaultLocale)
  let locale = defaultLocale

  for (const i of availableLocalesArr) {
    if (i === osLocale) {
      locale = i
      break
    }
  }

  return locale
}

import { v4 as uuidv4 } from 'uuid'
import cpt from 'crypto-js'

import { ElOptionItem } from '@/types_common'
// import { currentLocaleDirection } from '@/libs/init/i18n'
import { formatDateTime } from './string'
import { DecimalConverter } from '@/utils/number'

export const md5 = (message: string) => cpt.MD5(message).toString()

export const sha256 = (message: string) => cpt.SHA256(message).toString()

export const genMasterPasswordSha256 = (password: string, salt: string) => {
  return sha256(password + salt)
}

export enum TimeHashedSignType {
  // Simple
  uuidV4 = 'uuidV4',
  timestamp = 'timestamp',
  timestamp36 = 'timestamp36',
  timestamp62 = 'timestamp62',
  formattedTime = 'formattedTime',

  // complex
  uuidV4Sha256 = 'uuidV4Sha256',
  formattedTimeSha256 = 'formattedTimeSha256',
}

const randomPostfix = () => {
  return `_${Math.floor((1 + Math.random()) * 0x10000).toString(16)}`
}

// lib
export const getFormatedDateStr = (timeFormat: string) => {
  return `${formatDateTime(new Date(), timeFormat) + randomPostfix()}`
}

export const getFormatedDateStrMd5 = (timeFormat: string) => {
  return md5(getFormatedDateStr(timeFormat))
}

export const getFormatedDateStrSha256 = (timeFormat: string) => {
  return sha256(getFormatedDateStr(timeFormat))
}

// Simple
export const genTimestamp = () => {
  return (new Date()).valueOf().toString() + randomPostfix()
}

export const genTimestampChar36 = () => {
  return (new Date()).valueOf().toString(36) + randomPostfix()
}

export const genTimestampChar62 = () => {
  const dc = new DecimalConverter()
  return dc.decimalToText((new Date()).valueOf()) + randomPostfix()
}

export const genFormatedDate = (dateTimeFormat: string) => {
  return getFormatedDateStr(dateTimeFormat)
}

export const genUuidv4 = () => {
  return uuidv4()
}

// complex
export const genFormatedDateSha256 = (dateTimeFormat: string) => {
  return getFormatedDateStrSha256(dateTimeFormat)
}

export const genUuidv4Sha256 = () => {
  return sha256(uuidv4())
}

export const genFileNameByTime = (genType: keyof typeof TimeHashedSignType, dateTimeFormat: string, fileExt: string): string => {
  let prefix = '!!!'
  switch (genType) {
    // Simple
    case TimeHashedSignType.formattedTime:
      prefix = genFormatedDate(dateTimeFormat)
      break
    case TimeHashedSignType.timestamp:
      prefix = genTimestamp()
      break
    case TimeHashedSignType.timestamp36:
      prefix = genTimestampChar36()
      break
    case TimeHashedSignType.timestamp62:
      prefix = genTimestampChar62()
      break
    case TimeHashedSignType.uuidV4:
      prefix = genUuidv4()
      break

    // complex
    case TimeHashedSignType.uuidV4Sha256:
      prefix = genUuidv4Sha256()
      break
    case TimeHashedSignType.formattedTimeSha256:
      prefix = genFormatedDateSha256(dateTimeFormat)
      break
  }

  return prefix + fileExt
}

export const getOptionFileNameRule = (): ElOptionItem[] => {
  return [
    // Simple
    {
      value: TimeHashedSignType.formattedTime,
      label: 'Formatted time'
    },
    {
      value: TimeHashedSignType.timestamp62,
      label: 'Timestamp 62'
    },
    {
      value: TimeHashedSignType.timestamp36,
      label: 'Timestamp 36'
    },
    {
      value: TimeHashedSignType.timestamp,
      label: 'Timestamp'
    },
    {
      value: TimeHashedSignType.uuidV4,
      label: 'UUID v4'
    },
    // complex
    {
      value: TimeHashedSignType.formattedTimeSha256,
      label: 'Formatted time SHA256'
    },
    {
      value: TimeHashedSignType.uuidV4Sha256,
      label: 'UUID v4 SHA256'
    }
  ]
}

/**
 * generate file naming rule demo html
 * @param t CallableFunction vue i18n translate function
 * @param dateTimeFormat string
 * @param fileExt string file extension
 * @returns string
 */
export const genFileNamingRuleDemoHtml = (t: CallableFunction, dateTimeFormat: string, fileExt: string) => {
  const isRtl = false
  // const isRtl = currentLocaleDirection() === 'RTL' // TODO
  return `
  <div class="${isRtl ? 'direction-rtl' : ''}">
    <p><span class='font-bold disp-inline-block'>${t('Formatted time')}: </span> ${genFileNameByTime(TimeHashedSignType.formattedTime, dateTimeFormat, fileExt)}</p>
    <p><span class='font-bold disp-inline-block'>${t('Timestamp')}: </span> ${genFileNameByTime(TimeHashedSignType.timestamp, dateTimeFormat, fileExt)}</p>
    <p><span class='font-bold disp-inline-block'>${t('Timestamp 36')}: </span> ${genFileNameByTime(TimeHashedSignType.timestamp36, dateTimeFormat, fileExt)}</p>
    <p><span class='font-bold disp-inline-block'>${t('Timestamp 62')}: </span> ${genFileNameByTime(TimeHashedSignType.timestamp62, dateTimeFormat, fileExt)}</p>
    <p><span class='font-bold disp-inline-block'>UUID v4: </span> ${genFileNameByTime(TimeHashedSignType.uuidV4, dateTimeFormat, fileExt)}</p>

    <p><span class='font-bold disp-inline-block'>${t('Formatted time SHA256')}: </span> ${genFileNameByTime(TimeHashedSignType.formattedTimeSha256, dateTimeFormat, fileExt)}</p>
    <p><span class='font-bold disp-inline-block'>UUID v4 SHA256: </span> ${genFileNameByTime(TimeHashedSignType.uuidV4Sha256, dateTimeFormat, fileExt)}</p>
  </div>
  `
}

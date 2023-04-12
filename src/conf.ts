import { ElOptionItem } from '@/types_common'
import { ProgressColorInfo } from './types'
import { TimeFormatYyyyMmDdHhMmSs } from './constants'
import { getOptionFileNameRule } from '@/utils/hash'

export const envIsDev = true

export const unicodeIcon = {
  Cabinet: String.fromCodePoint(0x1f5c4),
  Calendar: String.fromCodePoint(0x1f4c5),
  Dir: String.fromCodePoint(0x1f4c1),
  Document: String.fromCodePoint(0x1f4da),
  Email: String.fromCodePoint(0x1f4e7),
  File: String.fromCodePoint(0x1f5c3),
  Note: String.fromCodePoint(0xf5d2),
  Photo: String.fromCodePoint(0x1f4f8),
  Prohibited: String.fromCodePoint(0x1f6ab),
  Video: String.fromCodePoint(0x1f4fd),
  Warning: String.fromCodePoint(0x26a0)
}

export const settingOptions: { [key: string]: ElOptionItem[] } = {
  // ---------- appearance -----------
  locale: [],

  // ---------- datetime format -----------
  dateFormat: [
    {
      value: TimeFormatYyyyMmDdHhMmSs,
      label: '2022-12-31 01:02:03'
    },
    {
      value: 'YY-MM-DD HH:mm:ss',
      label: '22-12-31 01:02:03'
    },
    {
      value: 'MM-DD-YYYY HH:mm:ss',
      label: '12-31-2022 01:02:03'
    },
    {
      value: 'MM-DD-YY HH:mm:ss',
      label: '12-31-22 01:02:03'
    },

    {
      value: 'YYYY-MM-DD HH:mm:ss A',
      label: '2022-12-31 01:02:03 AM'
    },
    {
      value: 'YY-MM-DD HH:mm:ss A',
      label: '22-12-31 01:02:03 AM'
    },
    {
      value: 'MM-DD-YYYY HH:mm:ss A',
      label: '12-31-2022 01:02:03 AM'
    },
    {
      value: 'MM-DD-YY HH:mm:ss A',
      label: '12-31-22 01:02:03 AM'
    }
  ],

  // fileName rule
  fileNameRule: getOptionFileNameRule()
}

export const changeMasterPasswordProgressData: ProgressColorInfo[] = [
  {
    percent: 5, // Sync remote entry file, merge it into temp dir, 5%
    color: '#f56c6c'
  },
  {
    percent: 10, // Count the number of files(export / upload / download), 5%
    color: '#e6a23c'
  },
  {
    percent: 50, // Export re-encrypted files, 40%
    color: '#5cb87a'
  },
  {
    percent: 55, // Move the exported files to the cache directory, 5%
    color: '#6f7ad3'
  },
  {
    percent: 95, // Delete files, except sync locks, 40%
    color: '#1989fa'
  },
  {
    percent: 100, // Delete sync locks file, 5%, 100%
    color: '#5cb87a'
  }
]

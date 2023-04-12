import { TypeFile, TypeNote } from '@/constants'

import { tmplUserDataMap } from '@/types_template'
import { invoker } from '@/libs/commands/invoke'
import { getDateByTmStr } from '@/utils/time'

import {
  EntryFileSourceInfo, NotebookSourceInfo, EntryFileSourceInfoParsedRes,
  FileInfo, NotebookInfo, NoteInfo, TagInfo, UserDataInfo, UserFileMetaInfo
} from './types'
import { tmplMmanifestData } from './types_template'

export const parseEntryFile = (jsonStr: string): EntryFileSourceInfoParsedRes => {
  const res: EntryFileSourceInfoParsedRes = tmplMmanifestData()

  try {
    const data: EntryFileSourceInfo = JSON.parse(jsonStr)
    if (data.dataVersion === 1) {
      const nnn = parseNavColDataV1(data)
      res.userData = nnn
      res.lockFileName = data.lockFileName
      return res
    }
  } catch (error) {
    invoker.logError('>>> parseManifest error: ' + error)
    return res
  }

  return res
}

export const parseNavColDataV1 = (data: EntryFileSourceInfo): UserDataInfo => {
  const res: UserDataInfo = tmplUserDataMap()

  // ---------- notebooks ----------
  const noteBooksData = data.noteBooks
  const nbAttrsArr = noteBooksData.attrsArr
  const nbDataArr = noteBooksData.dataArr
  const resNotebookArr: NotebookInfo[] = []
  if (nbDataArr.length > 0) {
    for (const i of nbDataArr) {
      resNotebookArr.push({
        ctimeUtc: getDateByTmStr(i[nbAttrsArr.indexOf('ctimeUtc')]),
        mtimeUtc: getDateByTmStr(i[nbAttrsArr.indexOf('mtimeUtc')]),
        sign: i[nbAttrsArr.indexOf('sign')],
        icon: i[nbAttrsArr.indexOf('icon')],
        title: i[nbAttrsArr.indexOf('title')],
        tagsArr: getTagsArr(i[nbAttrsArr.indexOf('tagsSign')])
      } as NotebookInfo)
    }
  }
  res.notebooks = resNotebookArr
  // ---------- notebooks end ----------

  // ---------- files ----------
  const filesData = data.files
  const fAttrsArr = filesData.attrsArr
  const fDataArr = filesData.dataArr
  const resFileArr: FileInfo[] = []
  if (fDataArr.length > 0) {
    for (const i of fDataArr) {
      resFileArr.push({
        ctimeUtc: getDateByTmStr(i[fAttrsArr.indexOf('ctimeUtc')]),
        mtimeUtc: getDateByTmStr(i[fAttrsArr.indexOf('mtimeUtc')]),
        sign: i[fAttrsArr.indexOf('sign')],
        originalSize: parseFloat(i[fAttrsArr.indexOf('originalSize')]),
        originalSha256: i[fAttrsArr.indexOf('originalSha256')],
        sha256: i[fAttrsArr.indexOf('sha256')],
        title: i[fAttrsArr.indexOf('title')],
        tagsArr: getTagsArr(i[fAttrsArr.indexOf('tagsSign')]),
        content: i[fAttrsArr.indexOf('content')],
        type: TypeFile
      } as FileInfo)
    }
  }
  res.files = resFileArr
  // ---------- files end ----------

  // ---------- tags ----------
  const tagsData = data.tags
  const tagAttrsArr = tagsData.attrsArr
  const tagDataArr = tagsData.dataArr
  const resTagsArr: TagInfo[] = []
  if (tagDataArr.length > 0) {
    for (const i of tagDataArr) {
      resTagsArr.push({
        ctimeUtc: getDateByTmStr(i[tagAttrsArr.indexOf('ctimeUtc')]),
        mtimeUtc: getDateByTmStr(i[tagAttrsArr.indexOf('mtimeUtc')]),
        sign: i[tagAttrsArr.indexOf('sign')],
        icon: i[tagAttrsArr.indexOf('icon')],
        title: i[tagAttrsArr.indexOf('title')]
      } as TagInfo)
    }
  }
  res.tags = resTagsArr
  // ---------- tags end ----------

  // ---------- filesMeta ----------
  const fmData = data.filesMeta
  const fmAttrsArr = fmData.attrsArr
  const fmDataArr = fmData.dataArr
  const resFmArr: UserFileMetaInfo[] = []
  if (fmDataArr.length > 0) {
    for (const i of fmDataArr) {
      resFmArr.push({
        ctimeUtc: getDateByTmStr(i[fmAttrsArr.indexOf('ctimeUtc')]),
        dtimeUtc: getDateByTmStr(i[fmAttrsArr.indexOf('dtimeUtc')]),
        mtimeUtc: getDateByTmStr(i[fmAttrsArr.indexOf('mtimeUtc')]),
        size: parseInt(i[fmAttrsArr.indexOf('size')]),
        sign: i[fmAttrsArr.indexOf('sign')],
        sha256: i[fmAttrsArr.indexOf('sha256')]
      } as UserFileMetaInfo)
    }
  }
  res.filesMeta = resFmArr
  // ---------- filesMeta end ----------

  return res
}

export const parseNotebookJson = (jsonStr: string): NoteInfo[] => {
  const res: NoteInfo[] = []
  if (jsonStr === '') {
    return res
  }

  try {
    const data: NotebookSourceInfo = JSON.parse(jsonStr)
    return parseNotebookSourceV1(data)
  } catch (error) {
    invoker.logError('>>> parseNotebook error: ' + error)
    return res
  }
}

export const parseNotebookSourceV1 = (data: NotebookSourceInfo): NoteInfo[] => {
  const res: NoteInfo[] = []
  const attrsArr = data.attrsArr
  const dataArr = data.dataArr

  if (dataArr.length > 0) {
    for (const i of dataArr) {
      const itemType = i[attrsArr.indexOf('type')]
      if (itemType === TypeNote) {
        res.push({
          ctimeUtc: getDateByTmStr(i[attrsArr.indexOf('ctimeUtc')]),
          mtimeUtc: getDateByTmStr(i[attrsArr.indexOf('mtimeUtc')]),
          content: i[attrsArr.indexOf('content')],
          sign: i[attrsArr.indexOf('sign')],
          icon: i[attrsArr.indexOf('icon')],
          tagsArr: getTagsArr(i[attrsArr.indexOf('tagsSign')]),
          title: i[attrsArr.indexOf('title')],
          type: itemType
        })
      }
    }
  }

  return res
}

const getTagsArr = (tagsSign: string) => {
  const tagsHashedSignArr: string[] = []
  const tagsArrTemp: string[] = tagsSign.split(',')
  for (const i of tagsArrTemp) {
    if (i !== '') {
      tagsHashedSignArr.push(i)
    }
  }
  return tagsHashedSignArr
}

import { TypeFile, TypeNote } from '@/constants'
import { PaneData } from '@/components/pane/types'
import { tmplPaneData } from '@/components/pane/types_template'
import { CmdInvoke } from '@/libs/commands'
import { jsonCopy } from '@/utils/utils'

import {
  EntryFileSource, NotebookSource, EntryFileSourceParsedRes,
  FileInfo, NotebookInfo, NoteInfo, TagInfo
} from './types'
import { tmplMmanifestData } from './types_templates'

export const parseEntryFile = (jsonStr: string): EntryFileSourceParsedRes => {
  const res: EntryFileSourceParsedRes = jsonCopy(tmplMmanifestData)

  try {
    const data: EntryFileSource = JSON.parse(jsonStr)
    if (data.dataVersion === 1) {
      res.paneData = parseNavColDataV1(data)
      res.syncLockFileName = data.syncLockFileName
      return res
    }
  } catch (error) {
    CmdInvoke.logError('>>> parseManifest error: ' + error)
    return res
  }

  return res
}

export const parseNavColDataV1 = (data: EntryFileSource): PaneData => {
  const res = tmplPaneData

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
  res.navigationCol.notebooks = resNotebookArr
  // ---------- notebooks end ----------

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
  res.navigationCol.tags = resTagsArr
  // ---------- tags end ----------

  // ---------- files ----------
  const filesData = data.files
  const fAttrsArr = filesData.attrsArr
  const fDataArr = filesData.dataArr
  const resFileArr: FileInfo[] = []
  if (fDataArr.length > 0) {
    for (const i of fDataArr) {
      resFileArr.push({
        ctimeUtc: getDateByTmStr(i[fAttrsArr.indexOf('ctimeUtc')]),
        dtimeUtc: getDateByTmStr(i[fAttrsArr.indexOf('dtimeUtc')]),
        mtimeUtc: getDateByTmStr(i[fAttrsArr.indexOf('mtimeUtc')]),
        sign: i[fAttrsArr.indexOf('sign')],
        size: parseFloat(i[fAttrsArr.indexOf('size')]),
        sha256: i[fAttrsArr.indexOf('sha256')],
        title: i[fAttrsArr.indexOf('title')],
        tagsArr: getTagsArr(i[fAttrsArr.indexOf('tagsSign')]),
        content: i[fAttrsArr.indexOf('content')],
        type: TypeFile
      } as FileInfo)
    }
  }
  res.navigationCol.files = resFileArr
  // ---------- files end ----------

  return res
}

export const parseNotebookJson = (jsonStr: string): NoteInfo[] => {
  const res: NoteInfo[] = []
  if (jsonStr === '') {
    return res
  }

  try {
    const data: NotebookSource = JSON.parse(jsonStr)
    return parseNotebookSourceV1(data)
  } catch (error) {
    CmdInvoke.logError('>>> parseNotebook error: ' + error)
    return res
  }
}

export const parseNotebookSourceV1 = (data: NotebookSource): NoteInfo[] => {
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

const getDateByTmStr = (tmStr: string) => {
  return new Date(tmStr)
}

import { TypeFile, TypeTag, TypeNote } from '@/constants'
import { NoteInfo, DocTypeInfo, FileTypeInfo } from '@/libs/user_data/types'

export type ListColTypeInfo = typeof TypeFile | typeof TypeTag | typeof TypeNote

export enum PaneIdsInfo {
  EditorCol = 'editor-column',
  ListCol = 'list-column',
  NavigationCol = 'navigation-column'
}

export enum PaneResizeTypeInfo {
  WidthOnly = 'WidthOnly',
  WidthAndOffset = 'WidthAndOffset',
}

export enum PaneSideInfo {
  Left = 'left',
  Right = 'right',
}

export type PaneControllerInfo = {
  focusModeEnabled: boolean,
  panesNameArr: string[]
}

export type CurrentFileInfo = {
  sign: string // hashed file name of currently opened
  indexInList: number // the index in list of the list column
  type: DocTypeInfo | FileTypeInfo
  content: string
  title: string
  tagsArr: string[]
}

export type ListColInfo = {
  sign: string
  icon: string
  noteList: NoteInfo[]
  title: string
  tagsArr: string[]
  type: ListColTypeInfo
}

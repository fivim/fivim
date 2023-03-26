import { TypeFile, TypeTag, TypeNote } from '@/constants'
import { NoteInfo, NotebookInfo, FileInfo, TagInfo, DocType, FileType } from '@/libs/user_data/types'

export type ListColType = typeof TypeFile | typeof TypeTag | typeof TypeNote

export enum PaneIds {
  EditorCol = 'editor-column',
  ListCol = 'list-column',
  NavigationCol = 'navigation-column'
}

export enum PaneResizeType {
  WidthOnly = 'WidthOnly',
  WidthAndOffset = 'WidthAndOffset',
}

export enum PaneSide {
  Left = 'left',
  Right = 'right',
}

export type PaneController = {
  focusModeEnabled: boolean,
  panesNameArr: string[]
}

export type EditorColData = {
  content: string
  sign: string
  title: string
  type: DocType | FileType
  tagsArr: string[]
}

export type ListColData = {
  sign: string
  icon: string
  list: NoteInfo[]
  title: string
  tagsArr: string[]
  type: ListColType
}

export type NavigationColData = {
  files: FileInfo[]
  notebooks: NotebookInfo[]
  tags: TagInfo[]
}

export type PaneData = {
  editorCol: EditorColData
  listCol: ListColData
  navigationCol: NavigationColData
}

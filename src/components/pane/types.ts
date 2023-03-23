import { ListColListTypeNotebook, ListColListTypeTag, DocTypeNote } from '@/constants'

export type DocType = typeof DocTypeNote
export type ListColType = typeof ListColListTypeNotebook | typeof ListColListTypeTag

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

// List item type, including note / tag / table
export type Note = {
  content: string
  ctimeUtc: Date
  hashedSign: string
  icon: string
  tagsArr: string[]
  title: string
  type: DocType
  mtimeUtc: Date
}

export type Notebook = {
  hashedSign: string
  icon: string
  title: string
  mtimeUtc: number // modify timestamp(in milliseconds) for notebook itself, update when add or edit
  tagsArr: string[]
}

export type Tag = {
  hashedSign: string
  icon: string
  title: string
  mtimeUtc: number // modify timestamp(in milliseconds) for tag itself, update when add or edit
}

export type EditorColData = {
  content: string
  hashedSign: string
  title: string
  type: DocType
  tagsArr: string[]
}

export type ListColData = {
  hashedSign: string
  icon: string
  list: Note[]
  title: string
  tagsArr: string[]
  type: ListColType
}

export type NavigationColData = {
  notebooks: Notebook[]
  tags: Tag[]
}

export type PaneData = {
  editorCol: EditorColData
  listCol: ListColData
  navigationCol: NavigationColData
}

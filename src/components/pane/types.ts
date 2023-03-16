import { ItemsListTypeNotebook, ItemsListTypeTag, DocTypeNote } from '@/constants'

export type DocType = typeof DocTypeNote
export type ItemsListType = typeof ItemsListTypeNotebook | typeof ItemsListTypeTag

export enum PaneIds {
  EditorColumn = 'editor-column',
  ItemsColumn = 'items-column',
  NavigationColumn = 'navigation-column'
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
  createTime: Date
  hashedSign: string
  icon: string
  tagsArr: string[]
  title: string
  type: DocType
  updateTime: Date
}

export type Notebook = {
  hashedSign: string
  icon: string
  title: string
  mtimeUtc: number // modify timestamp(in milliseconds) for notebook itself, update when add or edit
}

export type Tag = {
  hashedSign: string
  icon: string
  title: string
  mtimeUtc: number // modify timestamp(in milliseconds) for tag itself, update when add or edit
}

export type EditorColumnData = {
  content: string
  title: string
  type: DocType
}
export type ItemsColumnData = {
  hashedSign: string
  icon: string
  list: Note[]
  title: string
  type: ItemsListType
}

export type NavigationColumnData = {
  notebooks: Notebook[]
  tags: Tag[]
}

export type PaneData = {
  editorColumn: EditorColumnData
  itemsColumn: ItemsColumnData
  navigationColumn: NavigationColumnData
}

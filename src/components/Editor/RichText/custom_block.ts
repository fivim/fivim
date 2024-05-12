import { TYPE_NONE } from '@/constants'

import { TYPE_CODE_BLOCK } from './plugins/code-block/base'

export type BlockEleDataSet = {
	type: string
	uuid: string
	lang?: string
}

export type BlockElePreviewData = {
	uuid: string
	dataJsonStr: string
	innerHTML: string
}

export type BlockDataJson = {
	content: string
}

export type CustomBlockType = typeof TYPE_NONE | typeof TYPE_CODE_BLOCK
export type CustomBlockComponentRef = {
	initBlock: () => void
	genBlockRenderData: (dataset: BlockEleDataSet, dataJsonStr: string) => BlockElePreviewData
	setDialogOpen: (status: boolean) => void
	clickHandler: (target: HTMLDivElement, clostCbEle: Element) => void
}

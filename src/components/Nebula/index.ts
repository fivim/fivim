import ForceGraph3D from '3d-force-graph'

import { t } from 'i18next'

import { CN_TEMP_ELE, DomUtils } from '@exsied/exsied'

import { CN_ACTIONS } from '@/constants'
import { invoker } from '@/invoker'
import { pathToRelPath } from '@/stores_utils/path'
import { Func_Empty_Void } from '@/types'
import { getEleContentSize, showPopup } from '@/utils/dom'

import { reText, tagNamePattern } from '../LinkTags'
import globalStore from '@/stores/globalStore'

export type NebulaNode = {
	id: string
	desc: string
	group?: string
}

export type NebulaDataSet = {
	nodes: NebulaNode[]
	links: {
		source: string
		target: string
	}[]
}

export type NebulaLink = { source: string; target: string }

const CN_NEBULA_RENDER = 'nebula-render'

export async function showNebula(onOpenFile: (filePath: string, callback?: Func_Empty_Void) => void) {
	const NAME = 'Nebula'
	const ID = `exsied_${NAME}_popup`

	const contentHtml = `
		<div class="${CN_ACTIONS}">
		</div>
		<div class="${CN_NEBULA_RENDER}"></div>
		`

	const ele = showPopup({
		id: ID,
		classNames: [CN_TEMP_ELE],
		attrs: { TEMP_EDIT_ID: ID },
		contentAttrs: {},
		contentClassNames: [NAME],
		contentHtml,
		titlebarText: t('Nebula'),
		height: '100vh',
		width: '100vw',
	})

	document.body.appendChild(ele)
	DomUtils.limitElementRect(ele)

	const actionBlk = ele.querySelector(`.${CN_ACTIONS}`)
	if (!actionBlk) return
	const actionBlkEle = actionBlk as HTMLElement

	const titlebar = ele.querySelector(`.exsied-popup-titlebar`)
	if (!titlebar) return
	const titlebarEle = titlebar as HTMLElement

	const renderBlk = ele.querySelector(`.${CN_NEBULA_RENDER}`)
	if (renderBlk) {
		const size = getEleContentSize(ele)
		const rectTitlebarEle = titlebarEle.getBoundingClientRect()
		const rectActionsEle = actionBlkEle.getBoundingClientRect()

		const dir = globalStore.data.paths.userFiles
		const res = await invoker.searchInDir(dir, true, reText, 0, '', '', [])
		if (!res) {
			ele.remove()
			return
		}

		const nodes: NebulaNode[] = []
		const links: NebulaLink[] = []
		const tagNames: {
			[key: string]: {
				[key: string]: null
			}
		} = {}

		for (const item of res) {
			const pathRel = pathToRelPath(item.path)
			nodes.push({
				id: pathRel,
				desc: pathRel,
			})

			for (const m of item.matches) {
				const key = tagNamePattern.exec(m)
				if (key?.length === 2) {
					const uuid = key[1]

					if (!(uuid in tagNames)) {
						tagNames[uuid] = {}
					}

					tagNames[uuid][pathRel] = null
				}
			}
		}

		for (const key in tagNames) {
			if (Object.prototype.hasOwnProperty.call(tagNames, key)) {
				const element = tagNames[key]

				const array = Object.keys(element)
				const len = array.length
				for (let index = 0; index < len; index++) {
					const ele = array[index]

					if (index + 1 < len) {
						links.push({
							source: ele,
							target: array[index + 1],
						})
					}

					if (index + 1 === len) {
						links.push({
							source: array[index],
							target: array[0],
						})

						break
					}
				}
			}
		}

		const dataSet: NebulaDataSet = {
			nodes,
			links,
		}

		const Graph = ForceGraph3D()
		Graph(renderBlk as HTMLElement)
			.graphData(dataSet)
			.nodeLabel((node) => {
				const nd = node as NebulaNode
				return nd.desc
			})

			.nodeColor(Graph.nodeColor())
			.width(actionBlkEle.offsetWidth)
			.height(size.height - rectTitlebarEle.height - rectActionsEle.height - 10) // TODO:
			.showNavInfo(false)
			.nodeAutoColorBy('group')

		Graph.onEngineStop(() => Graph.zoomToFit(400))
		Graph.onNodeClick((node) => {
			const nnn = node as NebulaNode
			if (nnn.desc) {
				onOpenFile(globalStore.data.paths.userFiles + nnn.desc)
				ele.remove()
			}
		})
	}
}

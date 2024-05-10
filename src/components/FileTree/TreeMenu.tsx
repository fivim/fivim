import { Button, Popover, Tree } from 'antd'
import type { TreeDataNode, TreeProps } from 'antd'
import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
	DeleteOutlined,
	EditOutlined,
	FileAddOutlined,
	FileProtectOutlined,
	FolderAddOutlined,
	ImportOutlined,
	InfoCircleOutlined,
	MoreOutlined,
} from '@ant-design/icons'

import { TREE_DIR_PATH_PREFIX } from '@/constants'
import { invoker } from '@/invoker'
import globalStore from '@/stores/globalStore'
import { getFileName } from '@/utils/string'

interface Props {
	treeDataArr: TreeDataNode[]
	onClickNode: (event: any) => void
	onCreateDir: (event: any) => void
	onCreateFile: (event: any, ext: string) => void
	onMoveFile: (pathOld: string, pathNew: string) => Promise<boolean>
	onRenameFile: (event: any) => void
	onRenameDir: (event: any) => void
	onFileInfo: (event: any) => void
	onDel: (event: any) => void
	onImportFile: (event: any) => void
	onImportFileAndEncrypt: (event: any) => void
}

export const TreeMenu: React.FC<Props> = ({
	treeDataArr,
	onClickNode,
	onCreateDir,
	onCreateFile,
	onMoveFile,
	onRenameFile,
	onRenameDir,
	onFileInfo,
	onDel,
	onImportFile,
	onImportFileAndEncrypt,
}) => {
	const { t, i18n } = useTranslation()
	const GD = globalStore.getData()

	const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([])
	const [autoExpandParent, setAutoExpandParent] = useState(true)

	const onExpand = (newExpandedKeys: React.Key[]) => {
		setExpandedKeys(newExpandedKeys)
		setAutoExpandParent(false)
	}

	const [gData, setGData] = useState(treeDataArr)
	const onDrop: TreeProps['onDrop'] = async (info) => {
		const dropNode = info.node
		if (!(dropNode as any).is_dir) {
			invoker.error(t('A file cannot be a child of a file'))
			return
		}

		const dropKey = info.node.key
		const dragKey = info.dragNode.key
		const dropPos = info.node.pos.split('-')
		const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]) // the drop position relative to the drop node, inside 0, top -1, bottom 1

		const loop = (
			data: TreeDataNode[],
			key: React.Key,
			callback: (node: TreeDataNode, i: number, data: TreeDataNode[]) => void,
		) => {
			for (let i = 0; i < data.length; i++) {
				if (data[i].key === key) {
					return callback(data[i], i, data)
				}
				if (data[i].children) {
					loop(data[i].children!, key, callback)
				}
			}
		}
		const data = [...gData]

		// Find dragObject
		let dragObj: TreeDataNode | null = null
		loop(data, dragKey, async (item, index, arr) => {
			arr.splice(index, 1)
			dragObj = item
		})

		if (dragObj === null) return

		// Move file
		const filePathOld = (dragObj as TreeDataNode).key.toString()
		const targetDir = dropNode.key.toString()
		const filePathNew = targetDir + globalStore.data.pathSeparator + getFileName(filePathOld, '')
		const moved = await onMoveFile(filePathOld, filePathNew)
		if (!moved) {
			invoker.error(t('File move error'))
			return
		}

		// Update tree data
		if (!info.dropToGap) {
			// Drop on the content
			loop(data, dropKey, (item) => {
				item.children = item.children || []
				// where to insert. New item was inserted to the start of the array in this example, but can be anywhere
				item.children.unshift(dragObj as TreeDataNode)
			})
		} else {
			let ar: TreeDataNode[] = []
			let i: number
			loop(data, dropKey, (_item, index, arr) => {
				ar = arr
				i = index
			})
			if (dropPosition === -1) {
				// Drop on the top of the drop node
				ar.splice(i!, 0, dragObj!)
			} else {
				// Drop on the bottom of the drop node
				ar.splice(i! + 1, 0, dragObj!)
			}
		}
		setGData(data)
	}

	useEffect(() => {
		setGData(treeDataArr)
	}, [treeDataArr])

	const dirActions = (node: TreeDataNode) => {
		return (
			<>
				<div
					className="action-btn-row"
					onClick={() => {
						onCreateDir(node)
					}}
				>
					<Button type="text" shape="circle" icon={<FolderAddOutlined />}></Button>
					{t('Add directory')}
				</div>
				<div
					className="action-btn-row"
					onClick={() => {
						onCreateFile(node, '')
					}}
				>
					<Button type="text" shape="circle" icon={<FileAddOutlined />}></Button>
					{t('Add file')}
				</div>
				<div
					className="action-btn-row"
					onClick={() => {
						onImportFile(node)
					}}
				>
					<Button type="text" shape="circle" icon={<ImportOutlined />}></Button>
					{t('Import file')}
				</div>
				<div
					className="action-btn-row"
					onClick={() => {
						onImportFileAndEncrypt(node)
					}}
				>
					<Button type="text" shape="circle" icon={<FileProtectOutlined />}></Button>
					{t('Import file and encrypt it')}
				</div>
				<div
					className="action-btn-row"
					onClick={() => {
						onDel(node)
					}}
				>
					<Button type="text" shape="circle" icon={<DeleteOutlined />} danger></Button>
					{t('Delete')}
				</div>
			</>
		)
	}

	const fileActions = (node: TreeDataNode) => {
		return (
			<>
				<div
					className="action-btn-row"
					onClick={() => {
						onRenameFile(node)
					}}
				>
					<Button type="text" shape="circle" icon={<EditOutlined />}></Button>
					{t('Rename file')}
				</div>
				<div
					className="action-btn-row"
					onClick={() => {
						onFileInfo(node)
					}}
				>
					<Button type="text" shape="circle" icon={<InfoCircleOutlined />}></Button>
					{t('File info')}
				</div>

				<div
					className="action-btn-row"
					onClick={() => {
						onDel(node)
					}}
				>
					<Button type="text" shape="circle" icon={<DeleteOutlined />} danger></Button>
					{t('Delete')}
				</div>
			</>
		)
	}

	const titleRender = (node: TreeDataNode) => {
		const isDir = node.key?.toString().startsWith(TREE_DIR_PATH_PREFIX)

		return (
			<div className={classNames('flex-space-between')}>
				{/* Node title */}
				<div
					onClick={() => {
						onClickNode(node)
					}}
				>
					{isDir && <span className="text-bold">{node.title?.toString()}</span>}
					{!isDir && <span>{node.title?.toString()}</span>}
				</div>
				{/* Action buttons */}
				<div>
					{isDir && (
						<Popover content={dirActions(node)} trigger={'click'} placement={GD.isPcOs ? 'right' : 'left'}>
							<Button type="text" icon={<MoreOutlined />} onClick={(e) => e.stopPropagation()}></Button>
						</Popover>
					)}
					{!isDir && (
						<Popover content={fileActions(node)} trigger={'click'} placement={GD.isPcOs ? 'right' : 'left'}>
							<Button type="text" icon={<MoreOutlined />} onClick={(e) => e.stopPropagation()}></Button>
						</Popover>
					)}
				</div>
			</div>
		)
	}

	return (
		<div>
			<Tree
				onExpand={onExpand}
				expandedKeys={expandedKeys}
				autoExpandParent={autoExpandParent}
				treeData={treeDataArr}
				titleRender={titleRender}
				draggable
				onDrop={onDrop}
				blockNode
				showLine
				style={{ userSelect: 'none' }}
			/>
		</div>
	)
}

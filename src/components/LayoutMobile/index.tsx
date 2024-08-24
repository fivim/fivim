import { observer } from 'mobx-react-lite'
import React from 'react'

import Editor, { EditorComponentRef } from '@/components/Editor'
import { invoker } from '@/invoker'
import globalStore from '@/stores/globalStore'
import { EditorType } from '@/types'

import Sidebars from './SideBar'
import TitleBar from './TitleBar'

const MobileLayout: React.FC = () => {
	const editorRef = React.createRef<EditorComponentRef>()

	const saveEditorContent = async () => {
		if (editorRef.current) editorRef.current.saveEditorContent()
	}

	const onDecryptContent = async () => {
		if (editorRef.current) await editorRef.current.decryptContentText()
		globalStore.setTitlebarShowLockIcon(true)
		globalStore.setOpenMenuOpt(false)
	}

	const onSaveEncrypt = async () => {
		if (editorRef.current) {
			const cr = await editorRef.current.saveEncrypt()
			if (cr) globalStore.setTitlebarShowLockIcon(true)
			globalStore.setOpenMenuOpt(false)
		}
	}

	const onSaveUnencrypt = async () => {
		if (editorRef.current) editorRef.current.saveUnencrypt()
		globalStore.setTitlebarShowLockIcon(false)
		globalStore.setOpenMenuOpt(false)
	}

	const onRestoreContent = () => {
		if (editorRef.current) editorRef.current.restoreContentText()
		globalStore.setTitlebarShowLockIcon(false)
		globalStore.setOpenMenuOpt(false)
	}

	const onChangeEditorType = (et: EditorType) => {
		globalStore.setEditorType(et)
	}

	const onFileTreeOpened = async () => {
		const tree = await invoker.treeInfo(globalStore.data.paths.userFiles)
		if (tree !== null && tree.children) {
			globalStore.setFileTreeData(tree.children)
		}
	}

	const onOpenFile = async (filePath: string) => {
		if (editorRef.current) {
			const ir = await editorRef.current.setInitData(filePath)
			globalStore.setCurrentFilePath(ir.filePath)
			globalStore.setCurrentFileName(ir.fileName)
			globalStore.setTitlebarShowLockIcon(false)
			globalStore.setTitlebarText(ir.fileName)
			globalStore.setOpenMenuTree(false)
		} else {
			console.debug(`editorRef.current is null`)
		}
	}

	const onShowDrawerTree = () => {
		globalStore.setOpenMenuTree(true)
		onFileTreeOpened()
	}

	const onShowDrawerOpt = () => {
		globalStore.setOpenMenuOpt(true)
	}

	return (
		<>
			<TitleBar
				saveEditorContent={saveEditorContent}
				onShowDrawerTree={onShowDrawerTree}
				onShowDrawerOpt={onShowDrawerOpt}
			/>

			<Editor ref={editorRef} onChangeEditorType={onChangeEditorType} onOpenFile={onOpenFile} />

			<Sidebars
				onOpenFile={onOpenFile}
				onFileTreeOpened={onFileTreeOpened}
				onDecryptContent={onDecryptContent}
				onSaveEncrypt={onSaveEncrypt}
				onSaveUnencrypt={onSaveUnencrypt}
				onRestoreContent={onRestoreContent}
			/>
		</>
	)
}

export default observer(MobileLayout)

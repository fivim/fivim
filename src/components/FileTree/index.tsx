import { Button, Checkbox, Form, Input, Modal, Popover, Radio, TreeDataNode } from 'antd'
import { filesize } from 'filesize'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
	CloseOutlined,
	FileAddOutlined,
	FolderAddOutlined,
	ImportOutlined,
	PlusCircleOutlined,
	ReloadOutlined,
} from '@ant-design/icons'

import { TreeMenu } from '@/components/FileTree/TreeMenu'
import { EXT_MARKDOWN, EXT_RICH_TEXT, TREE_DIR_PATH_PREFIX, TYPE_NONE } from '@/constants'
import { invoker } from '@/invoker'
import { FileInfo } from '@/invoker/types'
import globalStore from '@/stores/globalStore'
import passwordStore from '@/stores/passwordStore'
import settingStore from '@/stores/settingStore'
import { pathToRelPath } from '@/stores_utils/path'
import { pathJoin } from '@/stores_utils/tauri_like'
import { syncAdapter, syncIsEnabled } from '@/synchronizer'
import { Func_Any_Void, Func_Empty_Void, Func_String_Void } from '@/types'
import { getDirByFilePath, getFileName } from '@/utils/string'
import { convertFileIndexTime } from '@/utils/time'

interface Props {
	onOpenFile: Func_String_Void
	onCloseMenu: Func_Any_Void
	onReloadMenu: Func_Empty_Void
	onModifyFile: Func_Empty_Void
	showCloseBtn?: boolean
	showReloadBtn?: boolean
}

const FileTree: React.FC<Props> = ({
	onOpenFile,
	onCloseMenu,
	onReloadMenu,
	onModifyFile,
	showCloseBtn,
	showReloadBtn,
}) => {
	const { t, i18n } = useTranslation()
	const SD = settingStore.getData()
	const GD = globalStore.getData()
	const encryptedFileExt = '.' + SD.encryptedFileExt

	const syncer = syncAdapter()

	// File actions
	const [modalFaExt, setModalFaExt] = useState('')
	const [modalFaOpen, setModalFaOpen] = useState(false)

	const handleOkFa = () => {
		setModalFaOpen(false)

		closeFaDialog()
	}
	const handleCancelFa = () => {
		setModalFaOpen(false)
	}

	// File infomation.
	const [modalFiOpen, setModalFiOpen] = useState(false)

	const handleOkFi = () => {
		setModalFiOpen(false)
	}

	const handleCancelFi = () => {
		setModalFiOpen(false)
	}

	const nodeIsDir = (node: TreeDataNode) => node.key.toString().startsWith(TREE_DIR_PATH_PREFIX)
	const nodePath = (node: TreeDataNode) => node.key.toString().replace(TREE_DIR_PATH_PREFIX, '')
	const nodeTitle = (node: TreeDataNode) => node.title?.toString() || '---'

	const onClickNode = async (node: TreeDataNode) => {
		if (!nodeIsDir(node)) {
			onOpenFile(nodePath(node))
		}
	}

	const TYPE_ADD_TO_ROOT = 'ADD_TO_ROOT'
	const TYPE_ADD_TO_NODE = 'ADD_TO_NODE'
	const TYPE_FILE_RENAME = 'FILE_RENAME'
	const TYPE_DIR_RENAME = 'DIR_RENAME'
	type DialogType =
		| typeof TYPE_ADD_TO_ROOT
		| typeof TYPE_ADD_TO_NODE
		| typeof TYPE_FILE_RENAME
		| typeof TYPE_DIR_RENAME
		| typeof TYPE_NONE

	const ADD_DIR_STR = t('Add directory')
	const ADD_FILE_STR = t('Add file')
	const RENAME_FILE_STR = t('Modify file name')
	const RENAME_DIR_STR = t('Modify dir name')
	const [dialogTitle, setDialogTitle] = useState('')
	const [dialogType, setDialogType] = useState<DialogType>(TYPE_NONE)
	const [name, setName] = useState('')
	const [fullyEncrypt, setFullyEncrypt] = useState(false)
	const [oldPathStr, setOldPathStr] = useState('')
	const [faNodePath, setFaNodePath] = useState('')

	const onCreateDir = async (node: TreeDataNode | null) => {
		setModalFaOpen(true)
		setModalFaExt('')
		setDialogTitle(ADD_DIR_STR)

		if (node === null) {
			setDialogType(TYPE_ADD_TO_ROOT)
		} else {
			setDialogType(TYPE_ADD_TO_NODE)
			setFaNodePath(nodePath(node))
		}
	}

	const onCreateFile = async (node: TreeDataNode | null, ext: string) => {
		setModalFaOpen(true)
		setModalFaExt(ext)
		setDialogTitle(ADD_FILE_STR)

		if (node === null) {
			setDialogType(TYPE_ADD_TO_ROOT)
		} else {
			setDialogType(TYPE_ADD_TO_NODE)
			setFaNodePath(nodePath(node))
		}
	}

	const onMoveFile = async (pathOld: string, pathNew: string) => {
		const opsOld = pathOld.replaceAll(TREE_DIR_PATH_PREFIX, '')
		const opsNew = pathNew.replaceAll(TREE_DIR_PATH_PREFIX, '')

		const oldPathRel = pathToRelPath(opsOld)
		const newPathRel = pathToRelPath(opsNew)

		const renameRes = await syncer.fileRename(oldPathRel, newPathRel)

		if (renameRes.errMsg !== '') {
			invoker.showMessage(t('Rename remote file failed'), renameRes.errMsg, 'error', true)
		} else {
			invoker.alert(t('Renaming local file'))
			if (await invoker.rename(opsOld, opsNew, false)) {
				invoker.success(t('Rename successful'))
				return true
			} else {
				invoker.error(t('Rename failed'))
			}
		}

		return false
	}

	const onFileRename = async (node: TreeDataNode) => {
		setModalFaOpen(true)
		setModalFaExt('')
		setDialogTitle(RENAME_FILE_STR)
		setDialogType(TYPE_FILE_RENAME)
		setOldPathStr(nodePath(node))
		setName(nodeTitle(node))
	}

	const closeFaDialog = async () => {
		if (settingStore.getUserFilesDir() === '') {
			invoker.error(t('Please set the user_files directory first'))
		}

		if (dialogTitle === ADD_DIR_STR) {
			// Only create directory on disk.
			const parentDir = dialogType === TYPE_ADD_TO_NODE ? faNodePath.toString() : settingStore.getUserFilesDir()
			const fullPath = await pathJoin(parentDir, name)

			if (await invoker.addDir(fullPath)) {
				invoker.success(t('Create successful'))
			} else {
				invoker.error(t('Create failed'))
			}
		} else if (dialogTitle === ADD_FILE_STR) {
			const fileNameFull = name + modalFaExt
			const parentDir = dialogType === TYPE_ADD_TO_NODE ? faNodePath.toString() : settingStore.getUserFilesDir()
			const fullPath = await pathJoin(parentDir, fileNameFull)
			const relPath = dialogType === TYPE_ADD_TO_NODE ? pathToRelPath(fullPath) : fileNameFull

			if (syncIsEnabled()) invoker.alert(t('Creating remote file'))
			const isBase64 = modalFaExt.endsWith(SD.encryptedFileExt)

			let emptyContent = ''
			if (isBase64) {
				const ccc = await invoker.encryptLocalFileContentBase64(passwordStore.getData(), [88, 74])
				if (ccc !== null) emptyContent = ccc
			}
			const resCreate = await syncer.fileCreateText(relPath, emptyContent, isBase64)
			if (resCreate.errMsg !== '') {
				const msg = resCreate.errMsg ? resCreate.errMsg : resCreate.errMsg
				invoker.showMessage(t('Create remote file failed'), msg, 'error', false)
			} else {
				invoker.alert(t('Creating local file'))
				if (await invoker.addFile(fullPath)) {
					invoker.success(t('Create successful'))
				} else {
					invoker.error(t('Create failed'))
				}
			}
		} else if (dialogType === TYPE_FILE_RENAME) {
			// Renmae
			if (syncIsEnabled()) invoker.alert(t('Renaming remote file'))
			const ops = oldPathStr.replaceAll('\\', '/')
			const oldPathRel = pathToRelPath(ops)
			const newPathRel = getDirByFilePath(oldPathRel, '/') + '/' + name
			const renameRes = await syncer.fileRename(oldPathRel, newPathRel)
			if (renameRes.errMsg !== '') {
				invoker.showMessage(t('Rename remote file failed'), renameRes.errMsg, 'error', true)
			} else {
				invoker.alert(t('Renaming local file'))
				const newPathAbs = await pathJoin(getDirByFilePath(ops, '/').replaceAll('/', GD.paths.separator), name)
				if (await invoker.rename(oldPathStr, newPathAbs, false)) {
					invoker.success(t('Rename successful'))
				} else {
					invoker.error(t('Rename failed'))
				}
			}

			setOldPathStr('')
		}

		setModalFaOpen(false)
		setDialogType(TYPE_NONE)
		onModifyFile()
	}

	const onDel = async (node: TreeDataNode) => {
		const fp = nodePath(node)
		const rp = pathToRelPath(fp)

		if (await invoker.confirm(t('Are you sure you want to delete ___name___', { name: node.title }), t('Warning'))) {
			if (nodeIsDir(node)) {
				if (syncIsEnabled()) invoker.alert(t('Deleting remote file'))
				const dfr = await syncer.dirDelete(rp)
				if (dfr.errMsg !== '') {
					invoker.showMessage(t('Delete remote file failed'), dfr.errMsg, 'error', true)
				} else {
					invoker.alert(t('Deleting local file'))
					if (!(await invoker.deleteDir(fp))) {
						console.error('deleteDir failed')
					} else {
						invoker.success(t('Deleting'))
					}
				}
			} else {
				if (syncIsEnabled()) invoker.alert(t('Deleting remote file'))
				const dfr = await syncer.fileDelete(rp)
				if (dfr.errMsg !== '') {
					invoker.showMessage(t('Delete remote file failed'), dfr.errMsg, 'error', true)
				} else {
					invoker.alert(t('Deleting local file'))
					const dfr = await invoker.deleteFile(fp)
					if (!dfr) {
						console.error('deleteFile failed')
					} else {
						invoker.success(t('Delete successful'))
					}
				}
			}
			onModifyFile()
		}
	}

	const importFile = async (parentDir: string) => {
		const filePathFrom = await invoker.pickFile()
		const fileName = getFileName(filePathFrom, '')
		const filePathTo = await pathJoin(parentDir, fileName)
		const rrr = await invoker.copyFile(filePathFrom, filePathTo)
		if (rrr) {
			syncer.fileCreateBin(fileName)
			onModifyFile()
		}
	}

	const importFileAndEncrypt = async (parentDir: string) => {
		const filePathFrom = await invoker.pickFile()
		const fileName = getFileName(filePathFrom, '')
		const fileNameTo = `${fileName}.${SD.encryptedFileExt}`
		const filePathTo = await pathJoin(parentDir, fileNameTo)
		const rrr = invoker.encryptLocalFile(passwordStore.getData(), filePathFrom, filePathTo)
		if (rrr !== null) {
			syncer.fileCreateBin(fileNameTo)
			onModifyFile()
		}
	}

	const onImportFileToRoot = async () => {
		importFile(settingStore.getUserFilesDir())
	}

	const onImportFileAndEncryptToRoot = async () => {
		importFileAndEncrypt(settingStore.getUserFilesDir())
	}

	const onImportFileToNode = async (node: TreeDataNode) => {
		importFile(nodePath(node))
	}

	const onImportFileAndEncryptToNode = async (node: TreeDataNode) => {
		importFileAndEncrypt(nodePath(node))
	}

	const [fileInfo, setFileInfo] = useState<FileInfo>({
		size: 0,
		createdTime: '',
		accessedTime: '',
		modifiedTime: '',
		errMsg: '',
	})

	const onFileInfo = async (node: TreeDataNode) => {
		setModalFiOpen(true)
		const p = node.key.toString()
		const fi = await invoker.fileInfo(p)
		if (fi) setFileInfo(fi)
	}

	type FieldType = {
		name: string
		fullyEncrypt: string
	}

	const headerActions = (
		<div>
			<div
				className="action-btn-row"
				onClick={() => {
					onCreateDir(null)
				}}
			>
				<Button type="text" shape="circle" icon={<FolderAddOutlined />}></Button>
				{t('Add directory')}
			</div>
			<div
				className="action-btn-row"
				onClick={() => {
					onCreateFile(null, '')
				}}
			>
				<Button type="text" shape="circle" icon={<FileAddOutlined />}></Button>
				{t('Add file')}
			</div>
			<div
				className="action-btn-row"
				onClick={() => {
					onImportFileToRoot()
				}}
			>
				<Button type="text" shape="circle" icon={<ImportOutlined />}></Button>
				{t('Import file')}
			</div>
			<div
				className="action-btn-row"
				onClick={() => {
					onImportFileAndEncryptToRoot()
				}}
			>
				<Button type="text" shape="circle" icon={<ImportOutlined />}></Button>
				{t('Import file and encrypt it')}
			</div>
		</div>
	)

	return (
		<>
			<div className="disp-flex pb-4">
				<span style={{ flex: '1' }}>
					<span className="text-bold highlight-color2"> {t('File tree')} </span>

					<Popover content={headerActions} trigger={'click'}>
						<Button type="text" shape="circle" icon={<PlusCircleOutlined />}></Button>
					</Popover>
				</span>

				{showCloseBtn && (
					<span className="pt-1 pr-2 cur-ptr" onClick={onCloseMenu}>
						<CloseOutlined />
					</span>
				)}
				{showReloadBtn && (
					<span className="pt-1 pr-2 cur-ptr" onClick={onReloadMenu}>
						<ReloadOutlined />
					</span>
				)}
			</div>

			<TreeMenu
				treeDataArr={GD.fileTreeData}
				onClickNode={onClickNode}
				onCreateDir={onCreateDir}
				onCreateFile={onCreateFile}
				onMoveFile={onMoveFile}
				onRenameFile={onFileRename}
				onRenameDir={() => {}}
				onFileInfo={onFileInfo}
				onDel={onDel}
				onImportFile={onImportFileToNode}
				onImportFileAndEncrypt={onImportFileAndEncryptToNode}
			/>

			{/* Modal of file operating */}
			<Modal
				title={dialogTitle}
				okText={t('OK')}
				cancelText={t('Cancel')}
				open={modalFaOpen}
				onOk={handleOkFa}
				onCancel={handleCancelFa}
			>
				<Form initialValues={{ name: '', fullyEncrypt: false }}>
					{(dialogType === TYPE_FILE_RENAME || dialogType === TYPE_DIR_RENAME) && (
						<div className="py-2 text-break-all text-color">
							{t('Original file name')}: {pathToRelPath(oldPathStr)}
						</div>
					)}

					<Form.Item<FieldType> label={t('Name')}>
						<Input
							value={name}
							onChange={(e) => {
								setName(e.target.value)
							}}
							addonAfter={modalFaExt}
						/>
					</Form.Item>

					{dialogTitle === ADD_FILE_STR && (
						<>
							{/* TODO: Add support fot rename file. */}
							<Form.Item<FieldType> label={t('File extension')}>
								<Radio.Group
									onChange={(e) => {
										let faExt = e.target.value
										if (modalFaExt.indexOf(encryptedFileExt) > -1) {
											faExt += encryptedFileExt
										}
										setModalFaExt(faExt)
									}}
								>
									<Radio className="w-full py-2" value={''}>
										{t('None')}
									</Radio>
									<Radio className="w-full py-2" value={`.${EXT_MARKDOWN[0]}`}>
										{`.${EXT_MARKDOWN[0]}`} (Markdown)
									</Radio>
									<Radio className="w-full py-2" value={`.${EXT_RICH_TEXT[0]}`}>
										{`.${EXT_RICH_TEXT[0]}`} (rich text mrakup)
									</Radio>
								</Radio.Group>
							</Form.Item>
							<Form.Item<FieldType> label="">
								<Checkbox
									onChange={(e) => {
										const checked = e.target.checked
										setFullyEncrypt(checked)
										if (checked && modalFaExt.indexOf(encryptedFileExt) <= -1) {
											setModalFaExt(modalFaExt + encryptedFileExt)
										} else {
											const ext = modalFaExt.replaceAll(encryptedFileExt, '')
											setModalFaExt(ext)
										}
									}}
								>
									{t('Fully encrypet')}
								</Checkbox>
							</Form.Item>
						</>
					)}
				</Form>
			</Modal>

			{/* Modal of file info */}
			<Modal
				title={t('File info')}
				okText={t('OK')}
				cancelText={t('Cancel')}
				open={modalFiOpen}
				onOk={handleOkFi}
				onCancel={handleCancelFi}
			>
				<div>
					{t('File size')}: {filesize(fileInfo.size)}
				</div>
				<div>
					{t('Created time')}: {convertFileIndexTime(fileInfo.createdTime)}
				</div>
				<div>
					{t('Modified time')}: {convertFileIndexTime(fileInfo.modifiedTime)}
				</div>
				{fileInfo.errMsg !== '' && (
					<div>
						{t('Error message')}: {fileInfo.errMsg}
					</div>
				)}
			</Modal>
		</>
	)
}

export default observer(FileTree)

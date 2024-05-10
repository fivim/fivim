import { Result } from 'antd'
import { Base64 } from 'js-base64'
import { observer } from 'mobx-react-lite'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { SmileOutlined } from '@ant-design/icons'

import { ImageViewer } from '@/components/Editor/ImageViewer'
import { PdfViewer } from '@/components/Editor/PdfViewer'
import {
	LOCAL_FILE_LINK_PREFIX,
	TYPE_AUDIO,
	TYPE_IMAGE,
	TYPE_MD,
	TYPE_NONE,
	TYPE_PDF,
	TYPE_SOURCE_CODE,
	TYPE_XRTM,
} from '@/constants'
import { invoker } from '@/invoker'
import { WriteFileRes } from '@/invoker/types'
import passwordStore from '@/stores/passwordStore'
import settingStore from '@/stores/settingStore'
import { syncAdapter, syncIsEnabled } from '@/synchronizer'
import { pathToRelPath } from '@/synchronizer/sync_base'
import { EditorType } from '@/types'
import { osThemeIsDark } from '@/utils/media_query'
import {
	formatHtml,
	getDirByFilePath,
	getFileName,
	getFileNameExt,
	removeEnding,
	stringToUint8Array,
} from '@/utils/string'
import { pathJoin } from '@/utils/tauri_like'

import CmEditor from './CodeMirror'
import { RtEditor, EditorComponentRef as rtComponentRef } from './RichText'
import { externalFunctions as externalFunctionsJodImg } from './RichText/base'
import { AUDIO_EXT_ARR, IMAGE_EXT_ARR, SOURCE_CODE_EXT_ARR, WRONG_IMAGE_URL } from './constants'

export type EditorComponentRef = {
	saveEditorContent: () => void
	saveEditorContentNoCheck: () => void
	decryptContentText: () => Promise<void>
	saveEncrypt: () => Promise<boolean>
	saveUnencrypt: () => void
	restoreContentText: () => void
	setInitData: (filePath: string) => Promise<{ filePath: string; fileName: string }>
}

interface Props {
	onChangeEditorType: (event: EditorType) => void
	onOpenFile: (event: any) => void
}

const Editor = forwardRef<EditorComponentRef, Props>((props, ref) => {
	const { t, i18n } = useTranslation()
	const SD = settingStore.getData()

	const rtEditorRef = React.createRef<rtComponentRef>()

	const [contentText, setContentText] = useState('')
	const [contentPdf, setContentPdf] = useState('')
	const [contentImg, setContentImg] = useState('')
	const [contentAud, setContentAud] = useState('')

	const [editorType, setEditorType] = useState<EditorType>(TYPE_NONE)
	useEffect(() => {
		if (editorType !== TYPE_NONE) {
			initEditorContent()
		}
	}, [editorType])

	const contentOrigin = useRef('')
	const contentCurrent = useRef('')
	const currentFilePath = useRef('')
	const textIsEncrypted = useRef(false)
	const fileIsEncrypted = useRef(false)
	const filePath = useRef('')
	const fileName = useRef('')
	const [fileExt, setFileExt] = useState('')

	const syncer = syncAdapter()

	const setText = async (_content: string) => {
		contentCurrent.current = _content
		setContentText(_content)

		if (editorType === TYPE_XRTM && rtEditorRef) {
			rtEditorRef.current?.setValue(_content)
		}
	}

	const decryptContentText = async () => {
		const ddd = await invoker.decryptStringArray(passwordStore.getData(), contentCurrent.current.split('\n'))
		const content = ddd.join('\n')
		textIsEncrypted.current = true

		setText(content)
	}

	const saveEncrypt = async () => {
		const cr = await invoker.confirm(t('Are you sure you want to encrypt this file?'), t('Warning'))
		if (cr) textIsEncrypted.current = true
		return cr
	}

	const saveUnencrypt = () => {
		textIsEncrypted.current = false
	}

	const restoreContentText = () => {
		textIsEncrypted.current = false
		setText(contentOrigin.current)
	}

	const saveEditorContentDo = async () => {
		const fp = currentFilePath.current
		const rp = pathToRelPath(fp)

		let content = contentCurrent.current

		if (editorType == TYPE_XRTM && rtEditorRef) {
			const _content = rtEditorRef.current?.getValue() || ''
			content = await formatHtml(_content)
		}

		if (fileIsEncrypted.current) {
			content = await invoker.encryptLocalFileContentBase64(
				passwordStore.getData(),
				Array.from(stringToUint8Array(content)),
			)
		} else if (textIsEncrypted.current) {
			const ddd = await invoker.encryptStringArray(passwordStore.getData(), content.split('\n'))
			content = ddd.join('\n')
		}

		if (syncIsEnabled()) invoker.alert(t('Saving remote file'))
		const resUpdate = await syncer.fileUpdateText(rp, content, fileIsEncrypted.current)
		if (resUpdate.errMsg !== '') {
			const msg = resUpdate.errMsg ? resUpdate.errMsg : resUpdate.errMsg
			invoker.showMessage(t('Save remote file failed'), msg, 'warning', true)
		} else {
			invoker.alert(t('Saving local file'))
			let rw: WriteFileRes = {
				success: false,
				errMsg: '',
			}
			if (fileIsEncrypted.current) {
				rw = await invoker.writeBase64IntoFile(fp, content)
			} else {
				rw = await invoker.writeStringIntoFile(fp, content)
			}
			if (rw.success) {
				invoker.success(t('Save successful'))
			} else {
				invoker.warning(t('Save failed'))
			}
		}
	}

	const saveEditorContent = () => {
		const fp = currentFilePath.current
		if (fp === '') {
			invoker.alert(t('Please open the file before saving it'))
			return
		}
		saveEditorContentDo()
	}

	const saveEditorContentNoCheck = async () => {
		await saveEditorContentDo()
	}

	const editorOpenFile = async (_path: string) => {
		let resPath = _path
		let dir = ''

		_path = _path.trim()

		if (_path.startsWith('http://') || _path.startsWith('https://')) {
			invoker.showMessage(
				t('Hint message'),
				t('Please copy the URL and access it with a browser: ___url___', { url: _path }),
				'warning',
				true,
			)
			return
		}

		// If path starts with "/", use userFilesDir.
		if (_path.startsWith('/')) {
			dir = settingStore.getUserFilesDir()
		} else {
			dir = getDirByFilePath(currentFilePath.current, '')
		}
		resPath = await pathJoin(dir, _path)

		props.onOpenFile(resPath)
	}

	const loadImgBase64 = async (_path: string) => {
		_path = decodeURIComponent(_path).trim()

		// Base64 images don't need to be converted.
		if (_path.startsWith('data:image/')) {
			return _path
		}

		// Remote images don't need to be converted.
		if (_path.startsWith('http://') || _path.startsWith('https://')) {
			return _path
		}

		// Read base64 of local image.
		let dir = ''
		if (_path.startsWith(LOCAL_FILE_LINK_PREFIX)) _path = _path.replace(LOCAL_FILE_LINK_PREFIX, '')

		if (_path.startsWith('/')) {
			dir = settingStore.getUserFilesDir()
		} else {
			dir = getDirByFilePath(currentFilePath.current, '')
		}
		const resPath = await pathJoin(dir, _path)
		const fileExt = getFileNameExt(resPath).toLowerCase()
		const content =
			fileExt === SD.encryptedFileExt
				? await invoker.decryptLocalFileBase64(passwordStore.getData(), resPath)
				: await invoker.readFileToBase64String(resPath)

		if (content === '') {
			return WRONG_IMAGE_URL
		}

		return `data:image/${fileExt};base64,${content}`
	}

	externalFunctionsJodImg.loadImgBase64 = loadImgBase64
	externalFunctionsJodImg.editorOpenFile = editorOpenFile

	const initEditorType = (_fileExt: string) => {
		if (_fileExt === 'md') {
			setEditorType(TYPE_MD)
			if (editorType === TYPE_MD) initEditorContent()
			props.onChangeEditorType(TYPE_MD)
		} else if (_fileExt === 'xrtm') {
			setEditorType(TYPE_XRTM)
			if (editorType === TYPE_XRTM) initEditorContent()
			props.onChangeEditorType(TYPE_XRTM)
		} else if (SOURCE_CODE_EXT_ARR.indexOf(_fileExt) > -1) {
			setEditorType(TYPE_SOURCE_CODE)
			if (editorType === TYPE_SOURCE_CODE) initEditorContent()
			props.onChangeEditorType(TYPE_SOURCE_CODE)
		} else if (AUDIO_EXT_ARR.indexOf(_fileExt) > -1) {
			setEditorType(TYPE_AUDIO)
			if (editorType === TYPE_AUDIO) initEditorContent()
			props.onChangeEditorType(TYPE_AUDIO)
		} else if (IMAGE_EXT_ARR.indexOf(_fileExt) > -1) {
			setEditorType(TYPE_IMAGE)
			if (editorType === TYPE_IMAGE) initEditorContent()
			props.onChangeEditorType(TYPE_IMAGE)
		} else if (_fileExt === 'pdf') {
			setEditorType(TYPE_PDF)
			if (editorType === TYPE_PDF) initEditorContent()
			props.onChangeEditorType(TYPE_PDF)
		} else {
			props.onChangeEditorType(TYPE_NONE)

			invoker.confirm(t('Unsupported file types'), t('Warning'))
		}
	}

	const initEditorContent = async () => {
		if ([TYPE_MD, TYPE_XRTM, TYPE_SOURCE_CODE].indexOf(editorType) > -1) {
			// Text type file
			let _content = ''
			if (fileIsEncrypted.current) {
				const b64 = await invoker.decryptLocalFileBase64(passwordStore.getData(), filePath.current)

				_content = Base64.decode(b64)
			} else {
				_content = await invoker.readFileToString(filePath.current)
			}
			if (_content === null) {
				console.info('File content is null')
				_content = ''
			}

			contentOrigin.current = _content
			if (editorType === TYPE_MD) {
				setText(_content)
			} else {
				setText(_content)
			}
		} else if ([TYPE_PDF, TYPE_AUDIO, TYPE_IMAGE].indexOf(editorType) > -1) {
			// Binary type file
			let content = fileIsEncrypted.current
				? await invoker.decryptLocalFileBase64(passwordStore.getData(), filePath.current)
				: await invoker.readFileToBase64String(filePath.current)

			if (content === null) {
				console.info('File content is null')
				content = ''
			} else if (editorType === TYPE_PDF) {
				setContentPdf(`data:application/pdf;base64,${content}`)
			} else if (editorType === TYPE_IMAGE) {
				setContentImg(`data:image/${fileExt};base64,${content}`)
			} else if (editorType === TYPE_AUDIO) {
				setContentAud(`data:audio/${fileExt};base64,${content}`)
			}
		} else {
			invoker.alert(t('Unsupported file types'))
		}
	}

	const setInitData = async (_filePath: string) => {
		fileIsEncrypted.current = false
		textIsEncrypted.current = false

		const fileNameInner = getFileName(_filePath, '')
		let _fileExt = getFileNameExt(fileNameInner).toLowerCase()

		const isEncrypted = _fileExt === SD.encryptedFileExt
		if (isEncrypted) {
			fileIsEncrypted.current = true
			const fn = removeEnding(fileNameInner, `.${SD.encryptedFileExt}`)
			_fileExt = getFileNameExt(fn).toLowerCase()
		}

		filePath.current = _filePath
		fileName.current = fileNameInner
		setFileExt(_fileExt)

		currentFilePath.current = _filePath
		initEditorType(_fileExt)

		return { filePath: _filePath, fileName: fileNameInner }
	}

	useImperativeHandle(ref, () => ({
		saveEditorContent,
		saveEditorContentNoCheck,
		decryptContentText,
		saveEncrypt,
		saveUnencrypt,
		restoreContentText,
		setInitData,
	}))

	const onChangeText = (_str: string) => {
		contentCurrent.current = _str
	}

	const rtEditorParentRef = useRef<HTMLDivElement>(null)
	const handleKeyDown = (event: KeyboardEvent) => {
		// Save file
		if (event.ctrlKey && event.key === 's') {
			saveEditorContent()
		}
	}
	useEffect(() => {
		if (rtEditorParentRef.current) {
			rtEditorParentRef.current.addEventListener('keydown', handleKeyDown)
		}

		return () => {
			if (rtEditorParentRef.current) {
				rtEditorParentRef.current.removeEventListener('keydown', handleKeyDown)
			}
		}
	})

	return (
		<>
			{editorType === TYPE_NONE && <Result icon={<SmileOutlined />} title={t('Please open the file first')} />}

			{editorType === TYPE_XRTM && (
				<div ref={rtEditorParentRef}>
					<RtEditor ref={rtEditorRef} onOpenFile={editorOpenFile} onSaveFile={saveEditorContent} />
				</div>
			)}
			{(editorType === TYPE_SOURCE_CODE || editorType === TYPE_MD) && (
				<CmEditor
					content={contentText}
					onChange={onChangeText}
					isDarkMode={osThemeIsDark()}
					canChangeLang={true}
					fileExt={fileExt}
					onSaveFile={saveEditorContent}
				/>
			)}
			{editorType === TYPE_PDF && <PdfViewer base64Str={contentPdf} />}
			{editorType === TYPE_IMAGE && <ImageViewer src={contentImg} />}
			{editorType === TYPE_AUDIO && <p>Not yet implemented AUDIO </p>}
		</>
	)
})

export default observer(Editor)

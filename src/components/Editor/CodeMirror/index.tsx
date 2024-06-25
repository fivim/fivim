import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import parserMarkdown from 'prettier/plugins/markdown'
import prettier from 'prettier/standalone'
import React, { useEffect, useRef, useState } from 'react'

import { javascript } from '@codemirror/lang-javascript'
import { Compartment, Extension } from '@codemirror/state'

import i18n from '@/i18n'
import globalStore from '@/stores/globalStore'
import { Func_Empty_Void, Func_String_Void } from '@/types'

import { Select } from '../../Select'
import {
	DEFAULT_DARK_THEME,
	DEFAULT_LIGHT_THEME,
	FILE_EXT_LANG_MAP,
	FILE_EXT_LANG_MAP_KEY,
	LangsKey,
	ThemeName,
	cmSuppertedLang,
	getLang,
	getThemeByName,
	themesOptions,
} from './base'
import { md2html } from './md'
import styles from './styles.module.scss'
import { useCodeMirror } from './initCodeMirror'

const t = i18n.t

const language = new Compartment()

interface Props {
	canChangeLang: boolean
	className?: string
	content: string
	fileExt?: string
	height?: string
	isDarkMode: boolean
	lang?: string
	onChange: Func_String_Void
	onChangeLang?: Func_String_Void
	onSaveFile?: Func_Empty_Void
}

const SHOW_MD_PREVIEW_DEFAULT = false

const CmEditor: React.FC<Props> = ({
	canChangeLang,
	className,
	content,
	fileExt,
	height,
	isDarkMode,
	lang,
	onChange,
	onChangeLang,
	onSaveFile,
}) => {
	const GD = globalStore.getData()

	const [currentThemeName, setCurrentThemeName] = useState<ThemeName>(DEFAULT_LIGHT_THEME)
	const [currentTheme, setCurrentTheme] = useState<Extension>(getThemeByName(DEFAULT_LIGHT_THEME))

	const [currentLangName, setCurrentLangName] = useState<string>('')
	const [currentLang, setCurrentLang] = useState<Extension>(language.of(javascript()))

	const [extensions, setExtensions] = useState<Extension[]>([currentTheme, currentLang])

	const editor = useRef<HTMLDivElement>(null)
	const [cmContent, setCmContent] = useState('')

	const { state, view, container } = useCodeMirror({
		container: editor.current,
		value: cmContent,
		height,
		extensions,
		onChange: (param) => {
			if (onChange) onChange(param)
			currentContent.current = param
			previewMd()
		},
	})

	const cmRef = useRef<HTMLDivElement>(null)
	const previewMdRef = useRef<HTMLDivElement>(null)
	const currentContent = useRef('')

	const [showMdPreview, setShowMdPreview] = useState(SHOW_MD_PREVIEW_DEFAULT)

	const previewMd = async () => {
		if (previewMdRef.current) {
			if (showMdPreview) {
				const html = await md2html(currentContent.current)
				previewMdRef.current.innerHTML = html
			} else {
				previewMdRef.current.innerHTML = ''
			}
		}
	}

	const formatMd = async () => {
		try {
			const res = await prettier.format(currentContent.current, {
				parser: 'markdown',
				plugins: [parserMarkdown],
			})
			currentContent.current = res
			setCmContent(res)
			if (onChange) onChange(res)
		} catch (error) {
			console.error('fromat md error: ', error)
		}
	}

	const reset = (_content: string) => {
		if (isDarkMode) setThemeByName(DEFAULT_DARK_THEME)

		setShowMdPreview(SHOW_MD_PREVIEW_DEFAULT)
		// Preview markdown on PC
		if (fileExt === 'md' && SHOW_MD_PREVIEW_DEFAULT && GD.isPcOs) {
			previewMd()
		} else {
			setShowMdPreview(false)
		}
		currentContent.current = _content
		if (previewMdRef.current) {
			previewMdRef.current.innerHTML = ''
		}
	}

	const handleLangChange = (lang: LangsKey) => {
		const newLang = getLang(lang)

		if (newLang) {
			setCurrentLangName(newLang.language.name)
			setCurrentLang(newLang)
			setExtensions([currentTheme, newLang])
		}
	}

	const langsToOptions = () => {
		return cmSuppertedLang.map((item) => {
			return { label: item, value: item }
		})
	}

	const handleKeyDown = (event: KeyboardEvent) => {
		// Save file
		if (event.ctrlKey && event.key === 's') {
			if (onSaveFile) onSaveFile()
		}
	}

	const setThemeByName = (name: ThemeName) => {
		setCurrentThemeName(name)

		const theme = getThemeByName(name)
		if (theme) {
			setCurrentTheme(theme)
			setExtensions([theme, currentLang])
		}
	}

	useEffect(() => {
		reset('')

		if (cmRef.current) {
			cmRef.current.addEventListener('keydown', handleKeyDown)
		}

		return () => {
			if (cmRef.current) {
				cmRef.current.removeEventListener('keydown', handleKeyDown)
			}
		}
	}, [])

	useEffect(() => {
		reset(content)
		setCmContent(content)
	}, [content])

	useEffect(() => {
		previewMd()
	}, [showMdPreview])

	useEffect(() => {
		if (fileExt) {
			if (fileExt in FILE_EXT_LANG_MAP) {
				const extKey = fileExt as FILE_EXT_LANG_MAP_KEY
				const key = FILE_EXT_LANG_MAP[extKey] as LangsKey
				handleLangChange(key)
			}
		}
	}, [fileExt])

	useEffect(() => {
		if (lang) {
			if (lang in FILE_EXT_LANG_MAP) {
				handleLangChange(lang as LangsKey)
			}
		}
	}, [lang])

	return (
		<>
			<div className={styles.toolbar}>
				{canChangeLang && (
					<Select
						items={langsToOptions()}
						value={currentLangName}
						onChange={(val) => handleLangChange(val as LangsKey)}
						triggerTitle={t('Language')}
						placeholder={''}
						selectMaxHeight="50vh"
					/>
				)}

				<Select
					items={themesOptions}
					value={currentThemeName as string}
					onChange={(val) => {
						setThemeByName(val as ThemeName)
					}}
					triggerTitle={t('Theme')}
					placeholder={''}
					selectMaxHeight="50vh"
				/>

				{/* markdown preview */}
				{currentLangName === 'markdown' && (
					<>
						<span
							className={classNames('cur-ptr pl-2', styles.actionBtn)}
							style={{ color: showMdPreview ? 'var(--fvm-solid-clr)' : '' }}
							onClick={() => {
								setShowMdPreview(!showMdPreview)
							}}
						>
							{t('Preview')}
						</span>

						<span
							className={classNames('cur-ptr pl-2', styles.actionBtn)}
							onClick={() => {
								formatMd()
							}}
						>
							{t('Format')}
						</span>
					</>
				)}
			</div>

			<div className={classNames(styles.colContainer, styles.colContainerDesktop)} style={{ flex: 1 }} ref={cmRef}>
				<div ref={editor} className={classNames(styles.col, styles.CmWrapper, className)}></div>

				{/*  markdown preview	 */}
				<div
					className={classNames(styles.col, styles.colPreview)}
					ref={previewMdRef}
					style={{ height: height, display: showMdPreview ? '' : 'none' }}
				></div>
			</div>
		</>
	)
}

export default observer(CmEditor)

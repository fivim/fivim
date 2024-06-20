import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import parserMarkdown from 'prettier/plugins/markdown'
import prettier from 'prettier/standalone'
import React, { useEffect, useRef, useState } from 'react'

import { color } from '@uiw/codemirror-extensions-color'
import { langs } from '@uiw/codemirror-extensions-langs'
import { androidstudio } from '@uiw/codemirror-theme-androidstudio'
import { bbedit } from '@uiw/codemirror-theme-bbedit'
import { dracula } from '@uiw/codemirror-theme-dracula'
import { eclipse } from '@uiw/codemirror-theme-eclipse'
import { githubDark, githubLight } from '@uiw/codemirror-theme-github'
import { materialDark, materialLight } from '@uiw/codemirror-theme-material'
import { monokai } from '@uiw/codemirror-theme-monokai'
import { noctisLilac } from '@uiw/codemirror-theme-noctis-lilac'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import { xcodeDark, xcodeLight } from '@uiw/codemirror-theme-xcode'
import CodeMirror, { Extension, ViewUpdate } from '@uiw/react-codemirror'

import i18n from '@/i18n'
import globalStore from '@/stores/globalStore'
import { Func_Empty_Void, Func_String_Void } from '@/types'

import { Select } from '../../Select'
import { FILE_EXT_LANG_MAP, FILE_EXT_LANG_MAP_KEY, LangsKey, themesOptions } from './base'
import { md2html } from './md'
import styles from './styles.module.scss'

const t = i18n.t
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

	const [cmContent, setCmContent] = useState('')
	const [mode, setMode] = useState('')
	const [extensions, setExtensions] = useState<Extension[]>()
	const [theme, setTheme] = useState<Extension | 'light' | 'none' | 'dark'>()
	const [themeName, setThemeName] = useState<string>('light')
	const [showMdPreview, setShowMdPreview] = useState(SHOW_MD_PREVIEW_DEFAULT)

	const cmRef = useRef<HTMLDivElement>(null)
	const previewMdRef = useRef<HTMLDivElement>(null)
	const currentContent = useRef('')

	const _onChange = (str: string, viewUpdate: ViewUpdate) => {
		if (onChange) onChange(str)
		currentContent.current = str
		previewMd()
	}

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
		if (langs[lang]) {
			setExtensions([color, langs[lang]()])
		}
		setMode(lang)

		if (onChangeLang) onChangeLang(lang)
	}

	const langsToOptions = () => {
		const arr = Object.keys(langs).sort()
		return arr.map((item) => {
			return { label: item, value: item }
		})
	}

	const handleKeyDown = (event: KeyboardEvent) => {
		// Save file
		if (event.ctrlKey && event.key === 's') {
			if (onSaveFile) onSaveFile()
		}
	}

	const setThemeByName = (name: string) => {
		setThemeName(name)
		if (name === 'light') setTheme('light')
		if (name === 'dark') setTheme('dark')
		if (name === 'androidstudio') setTheme(androidstudio)
		if (name === 'bbedit') setTheme(bbedit)
		if (name === 'dracula') setTheme(dracula)
		if (name === 'eclipse') setTheme(eclipse)
		if (name === 'githubDark') setTheme(githubDark)
		if (name === 'githubLight') setTheme(githubLight)
		if (name === 'materialDark') setTheme(materialDark)
		if (name === 'materialLight') setTheme(materialLight)
		if (name === 'monokai') setTheme(monokai)
		if (name === 'noctisLilac') setTheme(noctisLilac)
		if (name === 'vscodeDark') setTheme(vscodeDark)
		if (name === 'xcodeDark') setTheme(xcodeDark)
		if (name === 'xcodeLight') setTheme(xcodeLight)
	}

	useEffect(() => {
		isDarkMode ? setThemeByName('dark') : setThemeByName('light')
		reset('')

		if (lang) handleLangChange(lang as LangsKey)

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
						value={mode}
						onChange={(val) => handleLangChange(val as keyof typeof langs)}
						triggerTitle={t('Language')}
						placeholder={''}
						selectMaxHeight="50vh"
					/>
				)}
				<Select
					items={themesOptions}
					value={themeName as string}
					onChange={(val) => {
						setThemeByName(val)
					}}
					triggerTitle={t('Theme')}
					placeholder={''}
					selectMaxHeight="50vh"
				/>

				{/* markdown preview */}
				{fileExt === 'md' && (
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
				<CodeMirror
					className={classNames(styles.col, className)}
					value={cmContent}
					height={height}
					theme={theme}
					extensions={extensions}
					onChange={_onChange}
				/>

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

import ace from 'ace-builds'
import 'ace-builds/esm-resolver'
import classNames from 'classnames'
import { t } from 'i18next'
import { observer } from 'mobx-react-lite'
import parserHtml from 'prettier/plugins/html'
import parserMarkdown from 'prettier/plugins/markdown'
import prettier from 'prettier/standalone'
import React, { useEffect, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import globalStore from '@/stores/globalStore'
import { Func_Empty_Void, Func_String_Void } from '@/types'
import { findVisibleEleRange } from '@/utils/dom'

import { Select } from '../../Select'
import { DATA_ATTR_LINE, htmlAddExtAttr, md2html } from '../html'
import {
	DEFAULT_DARK_THEME,
	DEFAULT_LIGHT_THEME,
	FILE_EXT_LANG_MAP,
	FILE_EXT_LANG_MAP_KEY,
	ThemeName,
	languageOption,
	themesOptions,
} from './base'
import styles from './styles.module.scss'

interface Props {
	canChangeLang: boolean
	className?: string
	content: string
	fileExt?: string
	height?: string
	isDarkMode: boolean
	lang?: string
	goToLine?: number
	findText?: string
	findTextIndex?: number
	onChange: Func_String_Void
	onChangeLang?: Func_String_Void
	onSaveFile?: Func_Empty_Void
}

const SHOW_MD_PREVIEW_DEFAULT = false

export const initAceEditor = (el: string | Element) => {
	const editor = ace.edit(el, {
		useWorker: false,
	})
	editor.setShowPrintMargin(false)

	return editor
}

export const AceEditor: React.FC<Props> = ({
	canChangeLang,
	className,
	content,
	fileExt,
	height,
	isDarkMode,
	lang,
	goToLine,
	findText,
	findTextIndex,
	onChange,
	onChangeLang,
	onSaveFile,
}) => {
	const GD = globalStore.getData()
	const [aceEditor, setEditor] = useState<ace.Ace.Editor | null>(null)
	const aceId = uuidv4()

	const crollingPart = useRef<'md' | 'html' | ''>('')

	const setScrollingPartMd = () => {
		crollingPart.current = 'md'
	}
	const setScrollingPartHtml = () => {
		crollingPart.current = 'html'
	}

	const addEventListenerMd = () => {
		document.getElementById(aceId)?.addEventListener('mouseover', setScrollingPartMd)
		document.getElementById(aceId)?.addEventListener('touchstart', setScrollingPartMd)
	}

	const addEventListenerHtml = () => {
		previewMdRef.current?.addEventListener('mouseover', setScrollingPartHtml)
		previewMdRef.current?.addEventListener('touchstart', setScrollingPartHtml)

		previewMdRef.current?.addEventListener('scroll', scrollMdWithHtmlHandler)
	}

	const removeEventListenerHtml = async () => {
		previewMdRef.current?.removeEventListener('mouseover', setScrollingPartHtml)
		previewMdRef.current?.removeEventListener('touchstart', setScrollingPartHtml)

		previewMdRef.current?.removeEventListener('scroll', scrollMdWithHtmlHandler)
	}

	const scrollMdWithHtmlHandler = () => {
		scrollMdWithHtml()
	}

	const initAce = () => {
		if (aceEditor !== null) return

		const editor = initAceEditor(aceId)
		editor.session.on('changeScrollTop', function () {
			scrollHtmlWithMd()
		})

		setEditor(editor)
		addEventListenerMd()
	}

	const [currentTheme, setCurrentTheme] = useState<ThemeName>(DEFAULT_LIGHT_THEME)
	const [currentLangMode, setCurrentLangMode] = useState<string>('')

	const cmRef = useRef<HTMLDivElement>(null)
	const previewMdRef = useRef<HTMLDivElement>(null)
	const currentContent = useRef('')

	const [showPreview, setShowMdPreview] = useState(SHOW_MD_PREVIEW_DEFAULT)

	const preview = async () => {
		if (previewMdRef.current) {
			if (showPreview) {
				let html = ''
				if (currentLangMode === 'ace/mode/markdown') {
					html = await md2html(currentContent.current)
				} else if (currentLangMode === 'ace/mode/html') {
					html = currentContent.current
				}
				previewMdRef.current.innerHTML = await htmlAddExtAttr(html)

				addEventListenerHtml()
			} else {
				previewMdRef.current.innerHTML = ''
				removeEventListenerHtml()
			}
		}
	}

	const format = async () => {
		try {
			let res = ''
			if (currentLangMode === 'ace/mode/markdown') {
				res = await prettier.format(currentContent.current, {
					parser: 'markdown',
					plugins: [parserMarkdown],
				})
			} else if (currentLangMode === 'ace/mode/html') {
				res = await prettier.format(currentContent.current, {
					parser: 'html',
					plugins: [parserHtml],
				})
			}

			currentContent.current = res
			if (onChange) onChange(res)
		} catch (error) {
			console.error('fromat md error: ', error)
		}
	}

	const getScrollingPart = () => {
		return crollingPart.current
	}

	const scrollMdWithHtml = () => {
		if (getScrollingPart() !== 'html') return

		const span = findVisibleEleRange(`span[${DATA_ATTR_LINE}]`)
		if (span.lowestEle === null) return

		const lineStrLowest = span.lowestEle.getAttribute(DATA_ATTR_LINE) || ''
		const lineNumberLowest = parseInt(lineStrLowest)

		if (aceEditor) aceEditor.gotoLine(lineNumberLowest, 0, false)
	}

	const scrollHtmlWithMd = () => {
		if (getScrollingPart() !== 'md') return

		const span = findVisibleEleRange(`.ace_gutter-cell `)
		if (span.highestEle === null) return
		const line = span.highestEle.textContent
		const lineNumber = parseInt(line || '')

		const spanEles = document.querySelectorAll(`span[${DATA_ATTR_LINE}]`)
		if (!spanEles) return

		for (const ele of spanEles) {
			if (parseInt(ele.getAttribute(DATA_ATTR_LINE) || '') >= lineNumber) {
				ele.scrollIntoView({
					// behavior: 'smooth',
					block: 'start',
				})
				break
			}
		}
	}
	const reset = (_content: string) => {
		if (isDarkMode) setCurrentTheme(DEFAULT_DARK_THEME)

		setShowMdPreview(SHOW_MD_PREVIEW_DEFAULT)
		// Preview markdown on PC
		if (fileExt === 'md' && SHOW_MD_PREVIEW_DEFAULT && GD.isPcOs) {
			preview()
		} else {
			setShowMdPreview(false)
		}
		currentContent.current = _content
		if (previewMdRef.current) {
			previewMdRef.current.innerHTML = ''
		}
	}

	const handleKeyDown = (event: KeyboardEvent) => {
		// Save file
		if (event.ctrlKey && event.key === 's') {
			if (onSaveFile) onSaveFile()
		}
	}

	useEffect(() => {
		reset('')

		if (cmRef.current) cmRef.current.addEventListener('keydown', handleKeyDown)

		return () => {
			if (cmRef.current) cmRef.current.removeEventListener('keydown', handleKeyDown)
		}
	}, [])

	useEffect(() => {
		initAce()
		reset(content)

		if (aceEditor !== null) {
			aceEditor.session.setValue(content)
		}
	}, [content])

	useEffect(() => {
		preview()

		if (!showPreview) removeEventListenerHtml()
	}, [showPreview])

	useEffect(() => {
		if (aceEditor !== null) {
			aceEditor.setTheme(currentTheme)
			aceEditor.session.setMode(currentLangMode)
		}
	}, [currentLangMode, currentTheme])

	useEffect(() => {
		if (aceEditor !== null) {
			if (findText !== undefined) {
				aceEditor.find(findText)
			}

			if (findTextIndex !== undefined) {
				if (findTextIndex > 0) {
					let currentIdx = 0
					try {
						while (currentIdx <= findTextIndex) {
							aceEditor.findNext()
							currentIdx++
						}
					} catch (error) {
						//
					}
				}
			}
		}
	}, [findText, findTextIndex])

	useEffect(() => {
		if (aceEditor !== null) {
			if (goToLine !== undefined) aceEditor.gotoLine(goToLine, 0, false)
		}
	}, [goToLine])

	useEffect(() => {
		if (fileExt && fileExt in FILE_EXT_LANG_MAP) {
			const extKey = fileExt as FILE_EXT_LANG_MAP_KEY
			const key = FILE_EXT_LANG_MAP[extKey]
			setCurrentLangMode('ace/mode/' + key)
		}
	}, [fileExt])

	useEffect(() => {
		if (lang) {
			if (lang in FILE_EXT_LANG_MAP) {
				setCurrentLangMode('ace/mode/' + lang)
			}
		}
	}, [lang])

	return (
		<>
			<div className={styles.toolbar}>
				{canChangeLang && (
					<Select
						items={languageOption}
						value={currentLangMode}
						onChange={(val) => setCurrentLangMode(val)}
						triggerTitle={t('Language')}
						placeholder={''}
						selectMaxHeight="50vh"
					/>
				)}

				<Select
					items={themesOptions}
					value={currentTheme}
					onChange={(val) => {
						setCurrentTheme(val as ThemeName)
					}}
					triggerTitle={t('Theme')}
					placeholder={''}
					selectMaxHeight="50vh"
				/>

				{/* preview button for markdown or html  */}
				{(currentLangMode === 'ace/mode/markdown' || currentLangMode === 'ace/mode/html') && (
					<>
						<span
							className={classNames('cur-ptr pl-2', styles.actionBtn)}
							style={{ color: showPreview ? 'var(--fvm-solid-clr)' : '' }}
							onClick={() => {
								setShowMdPreview(!showPreview)
							}}
						>
							{t('Preview')}
						</span>

						<span
							className={classNames('cur-ptr pl-2', styles.actionBtn)}
							onClick={() => {
								format()
							}}
						>
							{t('Format')}
						</span>
					</>
				)}
			</div>

			<div className={classNames(styles.colContainer, styles.colContainerDesktop)} style={{ flex: 1 }} ref={cmRef}>
				<div id={aceId} className={classNames(styles.col, styles.CmWrapper, className)}></div>
				{/*  preview	 */}
				<div
					className={classNames(styles.col, styles.colPreview)}
					ref={previewMdRef}
					style={{ height: height, display: showPreview ? '' : 'none' }}
				></div>
			</div>
		</>
	)
}

export default observer(AceEditor)

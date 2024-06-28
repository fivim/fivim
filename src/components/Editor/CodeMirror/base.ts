import { angular } from '@codemirror/lang-angular'
import { cpp } from '@codemirror/lang-cpp'
import { css } from '@codemirror/lang-css'
import { go } from '@codemirror/lang-go'
import { html } from '@codemirror/lang-html'
import { java } from '@codemirror/lang-java'
import { javascript } from '@codemirror/lang-javascript'
import { json } from '@codemirror/lang-json'
import { less } from '@codemirror/lang-less'
import { markdown } from '@codemirror/lang-markdown'
import { php } from '@codemirror/lang-php'
import { python } from '@codemirror/lang-python'
import { rust } from '@codemirror/lang-rust'
import { sass } from '@codemirror/lang-sass'
import { sql } from '@codemirror/lang-sql'
import { vue } from '@codemirror/lang-vue'
import { wast } from '@codemirror/lang-wast'
import { xml } from '@codemirror/lang-xml'
import { yaml } from '@codemirror/lang-yaml'
import { LanguageSupport } from '@codemirror/language'
import { dracula } from '@uiw/codemirror-theme-dracula'
import { materialDark, materialLight } from '@uiw/codemirror-theme-material'
import { monokai } from '@uiw/codemirror-theme-monokai'
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode'
import { xcodeDark, xcodeLight } from '@uiw/codemirror-theme-xcode'

import { SELECT_SEPARATOR } from '@/components/Select'

export type ThemeName =
	| 'materialLight'
	| 'vscodeLight'
	| 'xcodeLight'
	| 'materialDark'
	| 'vscodeDark'
	| 'xcodeDark'
	| 'dracula'
	| 'monokai'

export const themesOptions: ({ label: string; value: string } | typeof SELECT_SEPARATOR)[] = [
	{ label: 'material light', value: 'materialLight' },
	{ label: 'vscode dark', value: 'vscodeLight' },
	{ label: 'xcode light', value: 'xcodeLight' },
	SELECT_SEPARATOR,
	{ label: 'dracula', value: 'dracula' },
	{ label: 'monokai', value: 'monokai' },
	{ label: 'material dark', value: 'materialDark' },
	{ label: 'vscode dark', value: 'vscodeDark' },
	{ label: 'xcode dark', value: 'xcodeDark' },
]

export const DEFAULT_DARK_THEME = 'materialDark'
export const DEFAULT_LIGHT_THEME = 'materialLight'

export const getThemeByName = (name: ThemeName) => {
	if (name === 'materialLight') return materialLight
	if (name === 'vscodeLight') return vscodeLight
	if (name === 'xcodeLight') return xcodeLight
	if (name === 'materialDark') return materialDark
	if (name === 'vscodeDark') return vscodeDark
	if (name === 'xcodeDark') return xcodeDark
	if (name === 'dracula') return dracula
	if (name === 'monokai') return monokai

	return materialLight
}

export const FILE_EXT_LANG_MAP = {
	c: 'c',
	cpp: 'cpp',
	cs: 'csharp',
	css: 'css',
	dart: 'dart',
	erl: 'erlang',
	go: 'go',
	htm: 'html',
	html: 'html',
	java: 'java',
	jl: 'julia',
	js: 'javascript',
	jsx: 'jsx',
	json: 'json',
	kt: 'kotlin',
	less: 'less',
	lua: 'lua',
	md: 'markdown',
	php: 'php',
	pl: 'perl',
	pm: 'perl',
	ps: 'powershell',
	py: 'python',
	r: 'r',
	rb: 'ruby',
	rs: 'rust',
	sass: 'sass',
	scala: 'scala',
	scss: 'sass',
	sh: 'shell',
	sql: 'sql',
	swift: 'swift',
	toml: 'toml',
	ts: 'typescript',
	tsx: 'tsx',
	vb: 'vb',
	vue: 'vue',
	wast: 'wast',
	xml: 'xml',
	yaml: 'yaml',
}

export const cmSuppertedLang = [
	'angular',
	'cpp',
	'css',
	'go',
	'html',
	'java',
	'javascript',
	'json',
	'less',
	'markdown',
	'php',
	'python',
	'rust',
	'sass',
	'sql',
	'vue',
	'wast',
	'xml',
	'yaml',
]

export type FILE_EXT_LANG_MAP_KEY = keyof typeof FILE_EXT_LANG_MAP
export type LangsKey = (typeof cmSuppertedLang)[number]

export const getLang = (lang: string) => {
	let newLang: LanguageSupport | null = null

	if (lang === 'angular') newLang = angular()
	if (lang === 'cpp') newLang = cpp()
	if (lang === 'css') newLang = css()
	if (lang === 'go') newLang = go()
	if (lang === 'html') newLang = html()
	if (lang === 'java') newLang = java()
	if (lang === 'javascript') newLang = javascript()
	if (lang === 'json') newLang = json()
	if (lang === 'less') newLang = less()
	if (lang === 'markdown') newLang = markdown()
	if (lang === 'php') newLang = php()
	if (lang === 'python') newLang = python()
	if (lang === 'rust') newLang = rust()
	if (lang === 'sass') newLang = sass()
	if (lang === 'sql') newLang = sql()
	if (lang === 'vue') newLang = vue()
	if (lang === 'wast') newLang = wast()
	if (lang === 'xml') newLang = xml()
	if (lang === 'yaml') newLang = yaml()

	return newLang
}

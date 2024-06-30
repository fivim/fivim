import { decode } from 'he'
import parserHtml from 'prettier/plugins/html'
import prettier from 'prettier/standalone'

export const formatHtml = async (htmlString: string) => {
	return await prettier.format(htmlString, {
		parser: 'html',
		plugins: [parserHtml],

		// https://prettier.io/playground/
		arrowParens: 'always',
		bracketSameLine: false,
		bracketSpacing: true,
		semi: true,
		experimentalTernaries: false,
		singleQuote: false,
		jsxSingleQuote: false,
		quoteProps: 'as-needed',
		trailingComma: 'all',
		singleAttributePerLine: false,
		htmlWhitespaceSensitivity: 'ignore',
		vueIndentScriptAndStyle: false,
		proseWrap: 'preserve',
		insertPragma: false,
		printWidth: 120,
		requirePragma: false,
		tabWidth: 2,
		useTabs: true,
		embeddedLanguageFormatting: 'auto',
	})
}

export const removeHtmlTags = (htmlString: string) => {
	let str = htmlString

	const firstBracketIndex = str.indexOf('>')
	if (firstBracketIndex === -1 && str.lastIndexOf('<')) return str

	if (str.lastIndexOf('<', firstBracketIndex) == -1) {
		str = str.substring(firstBracketIndex + 1)
	}

	const lastBracketIndex = str.lastIndexOf('<')
	if (str.indexOf('>', lastBracketIndex) == -1) {
		str = str.substring(0, lastBracketIndex)
	}

	return str.replace(/<[^>]*>/g, '')
}

export const splitMulitLinesToHtmlEle = (text: string, tagName: string) => {
	if (text.indexOf('\n')) {
		if (tagName === '') tagName = 'div'
		const arr = text.split('\n')
		const arr2 = arr.map((item) => `<${tagName}>${item}</${tagName}>`)
		text = arr2.join('\n')
	}

	return text
}

export const addJsScript = (src: string) => {
	const script = document.createElement('script')
	script.type = 'text/javascript'
	script.src = src
	document.body.appendChild(script)
}

export const addCssStyle = (src: string) => {
	const link = document.createElement('link')
	link.rel = 'stylesheet'
	link.type = 'text/css'
	if (src) link.href = src
	document.body.appendChild(link)
}

export const insertStyleSheet = (styleStr: string) => {
	if (document.styleSheets.length === 0) addCssStyle('')

	const sheet = document.styleSheets[0]
	sheet.insertRule(styleStr, sheet.cssRules.length)
}

export const setTheme = (themeName: string) => {
	document.documentElement.setAttribute('theme', themeName)
}

export const setDarkMode = () => {
	document.documentElement.setAttribute('force-dark-mode', 'true')
	document.documentElement.classList.add('dark')
	document.documentElement.classList.remove('light')
}

export const resetDarkMode = () => {
	document.documentElement.removeAttribute('force-dark-mode')
	document.documentElement.classList.remove('dark')
	document.documentElement.classList.add('light')
}

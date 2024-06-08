import hljs from 'highlight.js'
import c from 'highlight.js/lib/languages/c'
import cpp from 'highlight.js/lib/languages/cpp'
import csharp from 'highlight.js/lib/languages/csharp'
import css from 'highlight.js/lib/languages/css'
import dart from 'highlight.js/lib/languages/dart'
import erlang from 'highlight.js/lib/languages/erlang'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import julia from 'highlight.js/lib/languages/julia'
import kotlin from 'highlight.js/lib/languages/kotlin'
import less from 'highlight.js/lib/languages/less'
import lua from 'highlight.js/lib/languages/lua'
import markdown from 'highlight.js/lib/languages/markdown'
import perl from 'highlight.js/lib/languages/perl'
import php from 'highlight.js/lib/languages/php'
import powershell from 'highlight.js/lib/languages/powershell'
import python from 'highlight.js/lib/languages/python'
import r from 'highlight.js/lib/languages/r'
import ruby from 'highlight.js/lib/languages/ruby'
import rust from 'highlight.js/lib/languages/rust'
import go from 'highlight.js/lib/languages/rust'
import scala from 'highlight.js/lib/languages/scala'
import shell from 'highlight.js/lib/languages/shell'
import sql from 'highlight.js/lib/languages/sql'
import swift from 'highlight.js/lib/languages/swift'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import yaml from 'highlight.js/lib/languages/yaml'
import 'highlight.js/styles/github-dark.css'

// Then register the languages you need
hljs.registerLanguage('c', c)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('csharp', csharp)
hljs.registerLanguage('css', css)
hljs.registerLanguage('dart', dart)
hljs.registerLanguage('erlang', erlang)
hljs.registerLanguage('java', java)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('json', json)
hljs.registerLanguage('julia', julia)
hljs.registerLanguage('kotlin', kotlin)
hljs.registerLanguage('lua', lua)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('powershell', powershell)
hljs.registerLanguage('python', python)
hljs.registerLanguage('r', r)
hljs.registerLanguage('ruby', ruby)
hljs.registerLanguage('rust', rust)
hljs.registerLanguage('go', go)
hljs.registerLanguage('scala', scala)
hljs.registerLanguage('shell', shell)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('swift', swift)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('yaml', yaml)

export const hljsLangMap = {
	bash: shell,
	c,
	cpp,
	csharp,
	css,
	dart,
	erlang,
	html: xml,
	java,
	javascript,
	js: javascript,
	json,
	julia,
	kotlin,
	less,
	lua,
	markdown,
	perl,
	php,
	powershell,
	python,
	r,
	ruby,
	rust,
	go,
	scala,
	sh: shell,
	shell,
	sql,
	swift,
	typescript,
	ts: typescript,
	xml,
	yaml,
}

export const supportedLangs = {
	bash: 'shell',
	c: 'c',
	cpp: 'cpp',
	csharp: 'csharp',
	css: 'css',
	dart: 'dart',
	erlang: 'erlang',
	html: 'xml',
	java: 'java',
	javascript: 'javascript',
	js: 'javascript',
	json: 'json',
	julia: 'julia',
	kotlin: 'kotlin',
	less: 'less',
	lua: 'lua',
	markdown: 'markdown',
	perl: 'perl',
	php: 'php',
	powershell: 'powershell',
	python: 'python',
	r: 'r',
	ruby: 'ruby',
	rust: 'rust',
	go: 'go',
	scala: 'scala',
	sh: 'shell',
	shell: 'shell',
	sql: 'sql',
	swift: 'swift',
	typescript: 'typescript',
	ts: 'typescript',
	xml: 'xml',
	yaml: 'yaml',
}

export type SupportedLangKey = keyof typeof supportedLangs

// https://github.com/highlightjs/highlight.js/blob/main/SUPPORTED_LANGUAGES.md
export const highlighCode = (str: string, lang: string) => {
	if (lang in hljsLangMap) {
		return hljs.highlight(str, { language: lang }).value
	}

	return str
}

/**
 *
 *
 * The custom block structure is:
 * <div class="custom-block" data-type="code-block" data-uuid="02ff98fa-36a1-45dc-999a-af8cdb227abf" data-lang="javascript">
 * 	<code class="dataJson">{"content":"let a=6;"}</code>
 * </div>
 *
 * Click the language button in the upper right corner of the code block to enter editing mode.
 */
import { Config } from 'jodit/esm/config'
import { pluginSystem } from 'jodit/esm/core/global'
import { Icon } from 'jodit/esm/core/ui'
import { IControlType, IJodit } from 'jodit/esm/types'
import { v4 as uuidv4 } from 'uuid'

import { highlighCode } from './highlight'
import './styles.scss'

export const TYPE_CODE_BLOCK = 'code-block'
export const CODE_BLOCK_DEFAULT_LANG = 'javascript'

export const genEmptyCodeBlock = () => {
	return `
		<div class="${TYPE_CODE_BLOCK}" data-type="code-block" data-uuid="${uuidv4()}" 
			data-lang="${CODE_BLOCK_DEFAULT_LANG}" contenteditable="false">
			<code class="dataJson">{"content":""}</code>
			<div class="preview">
				<small class="code-block-lang-tip">
					${CODE_BLOCK_DEFAULT_LANG}
				</small>
				<pre class="code-block-content hljs"></pre>
			</div>
		</div>
	`
}

export const previewCodeblock = (str: string, lang: string) => {
	const highlightedCode = highlighCode(str, lang)
	return `
		<small class="code-block-lang-tip">
			${lang}
		</small>
		<pre class="code-block-content hljs">			
			<code>\n${highlightedCode}</code>
		</pre>
		`
}

// https://icons.getbootstrap.com/icons/code-square/
const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-code-square" viewBox="0 0 16 16">
  <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
  <path d="M6.854 4.646a.5.5 0 0 1 0 .708L4.207 8l2.647 2.646a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 0 1 .708 0m2.292 0a.5.5 0 0 0 0 .708L11.793 8l-2.647 2.646a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708 0"/>
</svg>
`

export const insertCodeBlock = (editor: IJodit): void => {
	editor.registerButton({
		name: 'insertcodeblock',
		group: 'insert',
	})

	editor.registerCommand('insertCodeBlock', () => {
		editor.s.insertHTML(genEmptyCodeBlock())
		return false
	})
}

export const initCodeBlock = () => {
	Icon.set('insertcodeblock', svgIcon)

	Config.prototype.controls.insertCodeBlock = {
		command: 'insertCodeBlock',
		// tags: ['div'],
		tooltip: 'Insert Code Block',
	} as IControlType

	pluginSystem.add('insertCodeBlock', insertCodeBlock)
}

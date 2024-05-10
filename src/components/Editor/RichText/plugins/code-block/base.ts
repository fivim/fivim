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
import { v4 as uuidv4 } from 'uuid'

import { highlighCode } from './highlight'
import './styles.scss'

export const TYPE_CODE_BLOCK = 'code-block'
export const CODE_BLOCK_DEFAULT_LANG = 'javascript'

export type BlockEleDataSet = {
	type: string
	uuid: string
	lang?: string
}

export type BlockDataJson = {
	content: string
}

export const genEmptyCodeBlock = () => {
	return `
		<div class="custom-block" data-type="code-block" data-uuid="${uuidv4()}" 
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

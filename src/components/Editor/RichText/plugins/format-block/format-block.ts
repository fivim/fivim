import { pluginSystem } from 'jodit/esm/core/global'
import { HTMLTagNames, IJodit } from 'jodit/esm/types'
import { v4 as uuidv4 } from 'uuid'

const HeadingRe = /^h[1-6]$/

export function formatBlock(editor: IJodit): void {
	editor.registerButton({
		name: 'paragraph',
		group: 'font',
	})

	editor.registerCommand('formatblock', (command: string, second: string, third: string): false | void => {
		// TODO: Add  data-uuid for h1-h6
		let attributes = third.match(HeadingRe)
			? {
					'data-uuid': uuidv4(),
				}
			: undefined

		editor.s.commitStyle({
			element: third as HTMLTagNames,
			attributes,
		})

		editor.synchronizeValues()

		return false
	})
}

pluginSystem.add('formatBlock', formatBlock)

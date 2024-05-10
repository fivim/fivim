/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2024 Valeriy Chupurnov. All rights reserved. https://xdsoft.net
 */

/**
 * @module plugins/inline-popup
 */
import { attr } from 'jodit/esm/core/helpers/utils/attr'
import type { IControlType, IJodit } from 'jodit/types'

import { externalFunctions } from '@/components/Editor/RichText/base'

export default [
	{
		name: 'eye',
		tooltip: 'Open link',
		exec: (editor: IJodit, current): void => {
			const href = attr(current as HTMLElement, 'href')

			// xadd
			// Modify the link eye button
			if (href) externalFunctions.editorOpenFile(href)
		},
	},
	{
		name: 'link',
		tooltip: 'Edit link',
		icon: 'pencil',
	},
	'unlink',
	'brush',
	'file',
] as Array<IControlType | string>

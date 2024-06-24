/*
 * Exited uses a dual license.
 * You may conditionally use exsed under the MIT License, and
 * if you do not meet the conditions, authorization is required.
 *
 * Existing license:
 *     https://github.com/exsied/exsied/blob/main/LICENSE
 *     https://gitee.com/exsied/exsied/blob/main/LICENSE
 */
import { CN_TEMP_ELE, DomUtils, EleClickCallback } from '@exsied/exsied'
import { Commands, ExsiedPlugin } from '@exsied/exsied/dist/core/plugin'

import { CN_ICON, CN_ICON_LINK_TAG, PLUGIN_CONF, PLUGIN_NAME, POPUP_ID, TOOLTIP_TEXT } from './base'
import { insertLinkTag, onClickLinkTag } from './event_handlers'
import './styles.scss'

const commands: Commands = {}
commands[PLUGIN_NAME] = insertLinkTag

export const LinkTag: ExsiedPlugin = {
	name: PLUGIN_NAME,
	conf: PLUGIN_CONF,
	commands,

	toolBarControl: [
		{
			name: PLUGIN_NAME,
			tooltipText: TOOLTIP_TEXT,
			addToNormalToolbar: PLUGIN_CONF.addToNormalToolbar,
			addToNormalToolbarInsertMenu: PLUGIN_CONF.addToNormalToolbarInsertMenu,
			addToBubbleToolbar: PLUGIN_CONF.addToBubbleToolbar,

			eleType: 'button',
			iconClassName: CN_ICON,
			clickCallBack: commands[PLUGIN_NAME],
		},
	],

	addHandler: () => {
		EleClickCallback.addByClass(CN_ICON_LINK_TAG, onClickLinkTag)
	},
	removeHandler: () => {},
	checkHighlight: (_event) => {},
	removeTempEle: (_event) => {
		DomUtils.removeElementById(POPUP_ID)
		// DomUtils.removeElementByClass(CN_TEMP_ELE)
		// DomUtils.removeElementByClass('exsied-temp-ele')
	},
}

export default LinkTag

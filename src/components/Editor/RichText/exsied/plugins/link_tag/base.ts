/*
 * Exited uses a dual license.
 * You may conditionally use exsed under the MIT License, and
 * if you do not meet the conditions, authorization is required.
 *
 * Existing license:
 *     https://github.com/exsied/exsied/blob/main/LICENSE
 *     https://gitee.com/exsied/exsied/blob/main/LICENSE
 */
import { TN_SPAN } from '@exsied/exsied'

export const PLUGIN_NAME = 'LinkTag'
export const TOOLTIP_TEXT = 'Link tag'
export const CN_ICON = 'exsied-icon-link-tag'
export const POPUP_ID = `exsied_${PLUGIN_NAME}_popup`
export const CN_ICON_LINK_TAG = 'exsied-icon-link-tag'

export const CN_ROOT = 'exsied-link-tag-editor'
export const CN_PREVIEW = 'exsied-link-tag-preview'
export const CN_EDIT_VIEW = 'exsied-link-tag-edit-view'
export const CN_TAG_NAME = 'exsied-tag-name'
export const CN_EDIT_INPUT = 'exsied-link-tag-input'

export const CN_BTN_COPY = 'exsied-btn-copy'
export const CN_BTN_EDIT = 'exsied-link-tag-edit'
export const CN_BTN_TRASH = 'exsied-btn-link-tag-trash'
export const CN_BTN_CANCEL = 'exsied-btn-link-tag-cancel'
export const CN_BTN_CONFIRM_BTN = 'exsied-btn-link-tag-confirm'

export const DATA_ATTR_LINK_TAG_NAME = 'data-fivim-link-tag-name'

export type PluginConf = {
	addToNormalToolbar: boolean
	addToNormalToolbarInsertMenu: boolean
	addToBubbleToolbar: boolean
	contentTagTagName: string
}

export const PLUGIN_CONF: PluginConf = {
	addToNormalToolbar: false,
	addToNormalToolbarInsertMenu: true,
	addToBubbleToolbar: false,
	contentTagTagName: TN_SPAN,
}

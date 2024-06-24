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

export const PLUGIN_NAME = 'ContentTag'
export const TOOLTIP_TEXT = 'Content tag'
export const CN_ICON = 'exsied-icon-content-tag'
export const POPUP_ID = `exsied_${PLUGIN_NAME}_popup`

export const CN_ROOT = 'exsied-content-tag-editor'
export const CN_PREVIEW = 'exsied-content-tag-preview'
export const CN_EDIT_VIEW = 'exsied-content-tag-edit-view'
export const CN_TAG_NAME = 'exsied-tag-name'
export const CN_EDIT_INPUT = 'exsied-content-tag-input'

export const CN_BTN_COPY = 'exsied-btn-copy'
export const CN_BTN_EDIT = 'exsied-content-tag-edit'
export const CN_BTN_TRASH = 'exsied-btn-content-tag-trash'
export const CN_BTN_CANCEL = 'exsied-btn-content-tag-cancel'
export const CN_BTN_CONFIRM_BTN = 'exsied-btn-content-tag-confirm'

export const DATA_ATTR_CONTENT_TAG_NAME = 'data-fivim-content-tag-name'

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

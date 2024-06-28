/*
 * Exited uses a dual license.
 * You may conditionally use exsed under the MIT License, and
 * if you do not meet the conditions, authorization is required.
 *
 * Existing license:
 *     https://github.com/exsied/exsied/blob/main/LICENSE
 *     https://gitee.com/exsied/exsied/blob/main/LICENSE
 */
import { t } from 'i18next'
import { v4 as uuidv4 } from 'uuid'

import { CN_TEMP_ELE, DATA_ATTR_TEMP_EDIT, DomUtils, PopupView, exsied } from '@exsied/exsied'

import {
	CN_BTN_CANCEL,
	CN_BTN_CONFIRM_BTN,
	CN_BTN_COPY,
	CN_BTN_EDIT,
	CN_BTN_TRASH,
	CN_EDIT_INPUT,
	CN_EDIT_VIEW,
	CN_ICON_LINK_TAG,
	CN_PREVIEW,
	CN_ROOT,
	CN_TAG_NAME,
	DATA_ATTR_LINK_TAG_NAME,
	PLUGIN_CONF,
	PLUGIN_NAME,
	POPUP_ID,
	TOOLTIP_TEXT,
} from './base'

export function insertLinkTag() {
	const ele = document.createElement(PLUGIN_CONF.contentTagTagName)
	ele.classList.add(CN_ICON_LINK_TAG)
	ele.setAttribute(DATA_ATTR_LINK_TAG_NAME, uuidv4())

	if (exsied.elements.workplace) DomUtils.addElementBySelection(exsied.elements.workplace, ele)
}

export const onClickLinkTag = (event: Event) => {
	event.stopPropagation()
	event.preventDefault()

	const targetEle = event.target as HTMLAnchorElement
	targetEle.setAttribute(DATA_ATTR_TEMP_EDIT, PLUGIN_NAME)

	const content_tag_name = targetEle.getAttribute(DATA_ATTR_LINK_TAG_NAME) || ''
	const contentHtml = `					
        <div class="${CN_PREVIEW}">
			<div>
				<div>
					<span class="${CN_ICON_LINK_TAG}"></span>
					<strong>${t(TOOLTIP_TEXT)}</strong>
				</div>
				<div class="${CN_TAG_NAME}">${content_tag_name}</div>
			</div>
        
			<div class="exsied-actions">
				<div class="exsied-btn ${CN_BTN_COPY}">
					<i class="exsied-icon exsied-icon-copy"></i>
				</div>	
				<div class="exsied-btn ${CN_BTN_EDIT}">
					<i class="exsied-icon exsied-icon-edit"></i>
				</div>
				<div class="exsied-btn ${CN_BTN_TRASH}">
					<i class="exsied-icon exsied-icon-trash"></i>
				</div>
			</div>
        </div>
        <div class="${CN_EDIT_VIEW}" style="display: none">
        	<input class="${CN_EDIT_INPUT}" value="">	
			<div class="exsied-btn ${CN_BTN_CANCEL}">
				<i class="exsied-icon exsied-icon-cancel"></i>
			</div>
			<div class="exsied-btn ${CN_BTN_CONFIRM_BTN}">
				<i class="exsied-icon exsied-icon-confirm"></i>
			</div>
        </div>
        `

	const ele = PopupView.create({
		id: POPUP_ID,
		classNames: [CN_TEMP_ELE, CN_ROOT],
		attrs: { TEMP_EDIT_ID: PLUGIN_NAME },
		contentClassNames: ['exsied-link-tag-view'],
		contentAttrs: {},
		contentHtml,
	})

	const rect = targetEle.getBoundingClientRect()
	ele.style.position = 'absolute'
	ele.style.top = rect.bottom + 'px'
	ele.style.left = rect.left + 'px'

	document.body.appendChild(ele)
	DomUtils.limitElementRect(ele)

	const eleCopyBtn = ele.querySelector(`.${CN_BTN_COPY}`)
	if (eleCopyBtn) {
		eleCopyBtn.addEventListener('click', onClickCopyBtn)
	}

	const eleEditBtn = ele.querySelector(`.${CN_BTN_EDIT}`)
	if (eleEditBtn) {
		eleEditBtn.addEventListener('click', onClickEditBtn)
	}

	const eleTrashBtn = ele.querySelector(`.${CN_BTN_TRASH}`)
	if (eleTrashBtn) {
		eleTrashBtn.addEventListener('click', onClickTrashBtn)
	}

	const eleCancelBtn = ele.querySelector(`.${CN_BTN_CANCEL}`)
	if (eleCancelBtn) {
		eleCancelBtn.addEventListener('click', onClickConcelBtn)
	}

	const eleconfirmBtn = ele.querySelector(`.${CN_BTN_CONFIRM_BTN}`)
	if (eleconfirmBtn) {
		eleconfirmBtn.addEventListener('click', onClickConfirmBtn)
	}
}

export const onClickCopyBtn = (event: Event) => {
	const ele = document.querySelector(`[${DATA_ATTR_TEMP_EDIT}="${PLUGIN_NAME}"]`) as HTMLAnchorElement
	const linkName = ele.getAttribute(DATA_ATTR_LINK_TAG_NAME) || ''
	navigator.clipboard
		.writeText(linkName)
		.then(function () {
			console.log('Element HTML code copied to clipboard! ', linkName)
		})
		.catch(function (err) {
			console.error('Failed to copy text: ', err)
		})
}

export const onClickEditBtn = (event: Event) => {
	const root = (event.target as HTMLElement).closest(`.${CN_ROOT}`)
	const previewView = root?.querySelector(`.${CN_PREVIEW}`) as HTMLElement
	const editView = root?.querySelector(`.${CN_EDIT_VIEW}`) as HTMLElement

	const name = previewView.querySelector(`.${CN_TAG_NAME}`) as HTMLAnchorElement
	const input = editView.querySelector(`.${CN_EDIT_INPUT}`) as HTMLInputElement
	input.value = name.innerHTML

	previewView.style.display = 'none'
	editView.style.display = 'flex'
}

export const onClickTrashBtn = (_event: Event) => {
	const link = document.querySelector(`[${DATA_ATTR_TEMP_EDIT}="${PLUGIN_NAME}"]`) as HTMLAnchorElement
	const textContent = link.textContent || link.innerText
	link.parentNode?.replaceChild(document.createTextNode(textContent), link)
	link.removeAttribute(DATA_ATTR_TEMP_EDIT)

	DomUtils.removeElementById(POPUP_ID)
}

export const onClickConcelBtn = (_event: Event) => {
	const link = document.querySelector(`[${DATA_ATTR_TEMP_EDIT}="${PLUGIN_NAME}"]`) as HTMLAnchorElement
	link.removeAttribute(DATA_ATTR_TEMP_EDIT)

	DomUtils.removeElementById(POPUP_ID)
}

export const onClickConfirmBtn = (event: Event) => {
	const root = (event.target as HTMLElement).closest(`.${CN_ROOT}`)
	const editView = root?.querySelector(`.${CN_EDIT_VIEW}`) as HTMLElement

	const link = document.querySelector(`[${DATA_ATTR_TEMP_EDIT}="${PLUGIN_NAME}"]`) as HTMLAnchorElement
	const input = editView.querySelector(`.${CN_EDIT_INPUT}`) as HTMLInputElement
	link.setAttribute(DATA_ATTR_LINK_TAG_NAME, input.value)
	link.removeAttribute(DATA_ATTR_TEMP_EDIT)

	DomUtils.removeElementById(POPUP_ID)
}

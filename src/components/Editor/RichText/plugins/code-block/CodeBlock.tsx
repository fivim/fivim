import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { forwardRef, useImperativeHandle, useState } from 'react'

import Dialog, { ButtonPosition } from '@/components/Dialog'
import stylesDialog from '@/components/Dialog/styles.module.scss'
import CmEditor from '@/components/Editor/CodeMirror'
import { TYPE_NONE } from '@/constants'
import i18n from '@/i18n'
import { StringStringObj } from '@/types'
import { osThemeIsDark } from '@/utils/media_query'

import {
	BlockDataJson,
	BlockEleDataSet,
	BlockElePreviewData,
	CustomBlockComponentRef,
	CustomBlockType,
} from '../../custom_block'
import { TYPE_CODE_BLOCK, initCodeBlock, previewCodeblock } from './base'
import { SupportedLangKey, supportedLangs } from './highlight'

const t = i18n.t

interface Props {
	blockType: CustomBlockType
	setBlockType: (t: CustomBlockType) => void
	blockContent: string
	setBlockContent: (content: string) => void
	blockEditingUuid: string
	setBlockEditingUuid: (content: string) => void
	blockEditingContent: string
	setBlockEditingContent: (content: string) => void
	onRemoveCustomBlockByUuid: (uuid: string) => void
	onUpdateCustomBlockByUuid: (uuid: string, dataJsonStr: string, previewStr: string, dataSet?: StringStringObj) => void
}

const CodeBlock = forwardRef<CustomBlockComponentRef, Props>(
	(
		{
			blockType,
			setBlockType,
			blockContent,
			setBlockContent,
			blockEditingUuid,
			setBlockEditingUuid,
			blockEditingContent,
			setBlockEditingContent,
			onRemoveCustomBlockByUuid,
			onUpdateCustomBlockByUuid,
		},
		ref,
	) => {
		const [blockLang, setBlockLang] = useState('')

		const genBlockRenderData = (dataset: BlockEleDataSet, dataJsonStr: string): BlockElePreviewData => {
			const blockLang = dataset.lang as string
			const uuid = dataset.uuid
			let innerHTML = ''

			try {
				const codeBlockData = JSON.parse(dataJsonStr) as BlockDataJson
				innerHTML = previewCodeblock(codeBlockData.content, blockLang)
			} catch (error) {
				console.log('An error occurred while parsing block data:', error)
			}

			return {
				uuid,
				dataJsonStr,
				innerHTML,
			}
		}

		const editBlock = (uuid: string, lang: string, dataEle: HTMLElement) => {
			setBlockEditingUuid(uuid)
			const dataStr = dataEle.innerHTML
			try {
				const codeBlockData = JSON.parse(dataStr) as BlockDataJson
				const blockLang = lang in supportedLangs ? supportedLangs[lang as SupportedLangKey] : lang
				setBlockLang(blockLang)
				setBlockContent(codeBlockData.content)
				setBlockEditingContent(codeBlockData.content)

				setDialogOpen(true)
			} catch (error) {
				console.log('An error occurred while parsing block data:', error)
			}
		}

		const clickHandler = (target: HTMLDivElement, clostCbEle: Element) => {
			// custom-block
			// Click the language tip to enter the edit window.
			if (target.classList.contains('code-block-lang-tip')) {
				const blockEle = clostCbEle as HTMLDivElement

				const ele = blockEle as HTMLElement
				const eleDataset = ele.dataset as BlockEleDataSet

				const dataJsonEle = ele.querySelector('.dataJson')
				if (!dataJsonEle) return false

				// Reset
				setBlockEditingUuid('')
				setBlockEditingContent('')
				setBlockType(TYPE_CODE_BLOCK)

				editBlock(eleDataset.uuid, eleDataset.lang as string, dataJsonEle as HTMLElement)
			}
		}

		useImperativeHandle(ref, () => ({
			initBlock: initCodeBlock,
			genBlockRenderData,
			setDialogOpen,
			clickHandler,
		}))

		const [dialogOpen, setDialogOpen] = useState(false)
		const [buttonPosition, setButtonPosition] = useState<ButtonPosition>('center')

		const dialogOk = () => {
			setDialogOpen(false)

			if (blockType === TYPE_CODE_BLOCK) {
				const content = blockEditingContent
				const previewHtm = previewCodeblock(content, blockLang)
				const dataJson: BlockDataJson = {
					content: content,
				}
				const dataJsonStr = JSON.stringify(dataJson)
				onUpdateCustomBlockByUuid(blockEditingUuid, dataJsonStr, previewHtm, {
					lang: blockLang,
				})
			}
		}

		const dialogCancel = () => {
			setDialogOpen(false)
		}

		return (
			<>
				{dialogOpen && (
					<Dialog
						animate={false}
						buttonPosition={buttonPosition}
						open={dialogOpen}
						title={blockType}
						okText={t('OK')}
						cancelText={t('Cancel')}
						okCallback={dialogOk}
						cancelCallback={dialogCancel}
						children={
							<>
								{blockType === TYPE_NONE && <div style={{ width: 500, height: 500, backgroundColor: '#0f0' }}></div>}
								{blockType === TYPE_CODE_BLOCK && (
									<div className={'joditorCodeBlock'}>
										<CmEditor
											content={blockContent}
											onChange={setBlockEditingContent}
											onChangeLang={setBlockLang}
											isDarkMode={osThemeIsDark()}
											canChangeLang={true}
											lang={blockLang}
										/>
									</div>
								)}
							</>
						}
						childrenExtButton={
							<button
								className={classNames(stylesDialog.Button, stylesDialog.Ext)}
								onClick={() => {
									onRemoveCustomBlockByUuid(blockEditingUuid)
									dialogCancel()
								}}
							>
								{t('Delete')}
							</button>
						}
					/>
				)}
			</>
		)
	},
)

export default observer(CodeBlock)

import classNames from 'classnames'
import { decode } from 'he'
import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'

import { CN_WORKPLACE_ACE, CN_WORKPLACE_EXSIED } from '@/constants'
import i18n from '@/i18n'
import { invoker } from '@/invoker'
import { SearchFileRes } from '@/invoker/types'
import globalStore from '@/stores/globalStore'
import { pathToRelPath } from '@/stores_utils/path'
import { removeHtmlTags } from '@/utils/html'
import { insertStringAt } from '@/utils/string'

import Collapsible from '../Collapsible'
import { EditorSetContentCallback } from '../Editor'
import { DATA_ATTR_LINK_TAG_NAME } from '../Editor/RichText/exsied/plugins/link_tag/base'
import styles from './styles.module.scss'

const t = i18n.t
export const reText = `${DATA_ATTR_LINK_TAG_NAME}=["']([^"']+)["']`
export const tagNamePattern = new RegExp(reText)
const tagPlaceholder = '«fivim-tag»'

function outputMatch(str: string) {
	let res = decode(removeHtmlTags(str))
	res = res.replace(tagPlaceholder, '<i class="exsied-icon-link-tag"></i>')
	return res
}

const conf = {
	contentLength: 10,
	classNameFileMatch: 'file-match-block',
	classNameFileMatchItem: 'file-match-item',
}

interface Props {
	onOpenFile: (event: any, callback?: EditorSetContentCallback) => Promise<void>
}

const LinkTags: React.FC<Props> = ({ onOpenFile }) => {
	const GD = globalStore.getData()

	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [currentTagName, setCurrentTagName] = useState<string>('')
	const [searchRes, setSearchRes] = useState<SearchFileRes[]>([])

	const [outboundLinks, setOutboundLinks] = useState<SearchFileRes[]>([])
	const [inboundLinks, setInboundLinks] = useState<SearchFileRes[]>([])

	const searchAllLinkTags = async () => {
		setIsLoading(true)
		const dir = globalStore.data.paths.userFiles
		const res = await invoker.searchInDir(dir, true, reText, 100, '', '', [])
		if (!res) return

		res.map((file, fileIndex) => {
			file.matches.map((matche, matcheIndex) => {
				const ttt = tagNamePattern.exec(matche)
				if (ttt && ttt.length >= 2) {
					const text = ttt[1]

					const index = matche.indexOf('>', matche.indexOf(text) + text.length)
					const precessed = insertStringAt(matche, index + 1, tagPlaceholder)

					res[fileIndex].matches[matcheIndex] = precessed
				}
			})
		})

		setSearchRes(res)
		setIsLoading(false)

		res.map((fileData, fileIndex) => {
			if (fileData.path === GD.currentFilePath) {
				setOutboundLinks([fileData])
			} else {
				setInboundLinks([fileData])
			}
		})
	}

	useEffect(() => {
		setTimeout(searchAllLinkTags, 200)
	}, [])

	const showInFile = async (path: string, index: number) => {
		await onOpenFile(path, (func) => {
			// in Exsied
			const workplaceExsiedEle = document.querySelector(`.${CN_WORKPLACE_EXSIED}`)
			if (workplaceExsiedEle) {
				const eles = workplaceExsiedEle.querySelectorAll(`[${DATA_ATTR_LINK_TAG_NAME}="${currentTagName}"]`)
				if (eles) {
					const ele = eles[index]
					ele.scrollIntoView({
						behavior: 'smooth',
						block: 'center',
					})
				}

				return
			}
			// in Ace
			const workplaceAce = document.querySelector(`.${CN_WORKPLACE_ACE}`)
			if (workplaceAce) {
				func({
					findText: currentTagName,
					findTextIndex: index,
				})
			}
		})
	}

	return (
		<>
			<div className={styles.Tags}>
				<>
					<span className="text-bold highlight-color2"> {t('Link tags')} </span>

					{searchRes.length > 0 ? (
						<>
							<div className={styles.TagsList}>
								<span className="highlight-color2"> {t('Outbound link tags')} </span>

								{outboundLinks.map((fileData, fileIndex) => {
									return (
										<Collapsible
											key={fileIndex}
											title={pathToRelPath(fileData.path)}
											dataArray={fileData.matches.map((matchedText, matcheIndex) => {
												return (
													<div
														className={classNames(styles.FileMatch, 'cur-ptr', 'pis-4', 'py-1')}
														onClick={() => {
															showInFile(fileData.path, matcheIndex)
														}}
														dangerouslySetInnerHTML={{ __html: outputMatch(matchedText) }}
														key={`${fileIndex}-${matcheIndex}`}
													></div>
												)
											})}
										/>
									)
								})}
							</div>
							<div className={styles.TagsList}>
								<span className="highlight-color2"> {t('Inbound link tags')} </span>

								{inboundLinks.map((fileData, fileIndex) => {
									return (
										<Collapsible
											key={fileIndex}
											title={pathToRelPath(fileData.path)}
											dataArray={fileData.matches.map((matchedText, matcheIndex) => {
												return (
													<div
														className={classNames(styles.FileMatch, 'cur-ptr', 'pis-4', 'py-1')}
														onClick={() => {
															showInFile(fileData.path, matcheIndex)
														}}
														dangerouslySetInnerHTML={{ __html: outputMatch(matchedText) }}
														key={`${fileIndex}-${matcheIndex}`}
													></div>
												)
											})}
										/>
									)
								})}
							</div>
						</>
					) : (
						<div> {isLoading ? t('Loading') : t('None')}</div>
					)}
				</>
			</div>
		</>
	)
}

export default observer(LinkTags)

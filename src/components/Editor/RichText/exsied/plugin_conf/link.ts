import { plugins } from '@exsied/exsied'
import { PluginConf as LinkConf } from '@exsied/exsied/dist/plugins/link/base'

import { externalFunctions, localLinkSignAdd, localLinkSignRemove } from '../../base'

const linkConf = plugins.link.conf as LinkConf

export function reconfLink() {
	linkConf.displayLinkCb = (link: string) => {
		return localLinkSignRemove(link)
	}
	linkConf.saveLinkCb = (link: string) => {
		return localLinkSignAdd(link)
	}
	linkConf.clickLinkCb = (event: MouseEvent) => {
		const target = event.target as HTMLLinkElement
		let filePath = target.href
		filePath = localLinkSignRemove(filePath)
		externalFunctions.editorOpenFile(filePath)
	}
}

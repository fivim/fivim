import { plugins } from '@exsied/exsied'
import { PluginConf as FontSizePluginConf } from '@exsied/exsied/dist/plugins/font_size/base'

const fontSizeConf = plugins.fontSize.conf as FontSizePluginConf
const fontSizeArr = [
	8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 50, 58, 64, 72, 80, 90, 100, 120, 140, 180, 220, 280,
]

export function reconfFontSize() {
	for (const item of fontSizeArr) {
		const option = `${item}px`
		let exist = false
		fontSizeConf.fontSizeOptions.map((item) => {
			if (item.name === option) {
				exist = true
			}
		})
		if (exist) continue

		fontSizeConf.fontSizeOptions.push({
			name: option,
			value: option,
			tooltipText: option,
		})
	}
}

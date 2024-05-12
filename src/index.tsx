import { ConfigProvider, theme } from 'antd'
import React from 'react'
import ReactDOM from 'react-dom/client'

import App from '@/App'

console.log(`
⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⣠⣶⣦⣴⣤⣴⣶⣄⣤⢀
⠀⠀⠀⠀⠀⠀⣠⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⡀⡀
⠀⠀⠀⠀⣠⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⡀
⠀⠀⢠⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⡄
⠀⢠⣿⣿⣿⣿⣿⣿⡿⠿⠛⠛⠛⠿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡄
⠀⣺⣿⣿⣿⣿⡟⠉⠀⠀⠀⠀⠀⠀⠀⠙⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣟
⢸⣿⣿⣿⣿⡟⠀⠀⠀⣶⣶⣶⣶⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢿⣿⣿⣿⣿⠇
⣿⣿⣿⣿⣿⡇⠀⠀⠀⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿
⢸⣿⣿⣿⣿⣧⠀⠀⠀⠛⠛⠛⠛⠃⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣾⣿⣿⣿⣿⡆
⠈⣿⣿⣿⣿⣿⣷⣀⠀⠀⠀⠀⠀⠀⠀⣠⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣯
⠀⠘⣿⣿⣿⣿⣿⣿⣷⣶⣤⣤⣤⣶⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠂
⠀⠀⠈⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠃
⠀⠀⠀⠀⠙⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠁
⠀⠀⠀⠀⠀⠀⠙⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠇⠁
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠙⠛⠻⠿⠻⠟⠻⠿⠋⠋⠈

Welcome to enassi
`)

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<ConfigProvider
			theme={{
				algorithm: theme.defaultAlgorithm,
				// token document: https://ant-design.antgroup.com/docs/react/customize-theme-cn#seedtoken
				token: {
					motion: false,
					borderRadius: 4,
				},
				cssVar: true,
				hashed: false,
			}}
		>
			<App />
		</ConfigProvider>
	</React.StrictMode>,
)

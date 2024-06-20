import { internalIpV4 } from 'internal-ip'
import { URL, fileURLToPath } from 'node:url'
import path from 'path'
import { defineConfig } from 'vite'
import eslintPlugin from 'vite-plugin-eslint'
import svgrPlugin from 'vite-plugin-svgr'
import topLevelAwaitPlugin from 'vite-plugin-top-level-await'

import reactPlugin from '@vitejs/plugin-react'

const mobile = !!/android|ios/.exec(process.env.TAURI_ENV_PLATFORM || '')

// https://vitejs.dev/config/
export default defineConfig(async () => ({
	plugins: [
		eslintPlugin({
			include: ['./src/**/*.ts', './src/**/*.tsx'],
			cache: false,
		}),
		// For @vitejs/plugin-legacy and pdfjs-dist
		topLevelAwaitPlugin({
			// The export name of top-level await promise for each chunk module
			promiseExportName: '__tla',
			// The function to generate import names of top-level await promise in each chunk module
			promiseImportName: (i) => `__tla_${i}`,
		}),
		reactPlugin(),
		svgrPlugin({ svgrOptions: { icon: true } }),
	],
	// base: './', // For @vitejs/plugin-legacy

	// Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
	//
	// 1. prevent vite from obscuring rust errors
	clearScreen: false,
	// 2. tauri expects a fixed port, fail if that port is not available
	server: {
		port: 3000,
		strictPort: true,
		// host: mobile ? "0.0.0.0" : false,
		host: '0.0.0.0',
		hmr: mobile
			? {
					protocol: 'ws',
					host: await internalIpV4(),
					port: 1421,
				}
			: undefined,
		watch: {
			// 3. tell vite to ignore watching `src-tauri`
			ignored: ['**/src-tauri/**'],
		},
	},
	build: {
		target: ['es2022', 'chrome100', 'safari15'],
		// https://rollupjs.org/configuration-options/#output-manualchunks
	},
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
}))

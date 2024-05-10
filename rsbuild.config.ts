import { pluginReact } from '@rsbuild/plugin-react'

const isDev = process.env.NODE_ENV === 'development'

/**
 * @type {import('@rspack/cli').Configuration}
 */
export default {
	context: __dirname,
	entry: {
		main: './src/index.tsx',
	},
	source: {
		alias: {
			'@': './src',
		},
	},
	resolve: {
		extensions: ['...', '.ts', '.tsx', '.jsx'],
	},
	module: {
		rules: [
			{
				test: /\.svg$/,
				type: 'asset',
			},
			{
				test: /\.(jsx?|tsx?)$/,
				use: [
					{
						loader: 'builtin:swc-loader',
						options: {
							sourceMap: true,
							jsc: {
								parser: {
									syntax: 'typescript',
									tsx: true,
								},
								transform: {
									react: {
										runtime: 'automatic',
										development: isDev,
										refresh: isDev,
									},
								},
							},
							env: {
								targets: ['chrome >= 87', 'edge >= 88', 'firefox >= 78', 'safari >= 14'],
							},
						},
					},
				],
			},
		],
	},
	plugins: [pluginReact()],
}

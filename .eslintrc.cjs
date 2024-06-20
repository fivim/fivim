// cmd: `./node_modules/.bin/eslint` --init or `npm init @eslint/config`

module.exports = {
	// env: {
	// 	browser: true,
	// 	es2021: true,
	// 	node: true,
	// },
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
		sourceType: 'module',
		ecmaVersion: 2020,
	},
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
	plugins: ['@typescript-eslint', '@stylistic'],
	rules: {
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-this-alias': 'off',
		'@typescript-eslint/no-unused-vars': 'off',
		'comma-dangle': 'off',
		'func-call-spacing': 'off',
		indent: 'off',
		'multiline-ternary': 'off',
		'no-multiple-empty-lines': 'off',
		'no-tabs': 'off',
		'no-undef': 'off',
		'no-unused-vars': 'off',
		'no-useless-escape': 'off',
		'no-useless-return': 'off',
		'prettier/prettier': 'off',
		'quote-props': 'off',
		quotes: 'off',
		'react/display-name': 'off',
		semi: 'off',
		'space-before-function-paren': [
			'error',
			{
				anonymous: 'always',
				named: 'never',
				asyncArrow: 'always',
			},
		],
	},
}

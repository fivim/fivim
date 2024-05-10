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
		// sourceType: 'module',
		// ecmaVersion: 2018,
	},
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
	plugins: ['@typescript-eslint', '@stylistic'],
	rules: {
		quotes: 'off',
		'no-unused-vars': 'off',
		'no-multiple-empty-lines': 'off',
		'no-useless-escape': 'off',
		'@typescript-eslint/no-unused-vars': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'quote-props': 'off',
		'comma-dangle': 'off',
		'func-call-spacing': 'off',
		'no-useless-return': 'off',
		'multiline-ternary': 'off',
		'no-undef': 'off',
		'react/display-name': 'off',
		'@typescript-eslint/no-this-alias': 'off',
		'prettier/prettier': 'off',
		semi: 'off',
		'no-tabs': 'off',
		indent: 'off',
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

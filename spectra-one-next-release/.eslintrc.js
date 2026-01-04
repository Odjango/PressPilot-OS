module.exports = {
	extends: [ 'plugin:@wordpress/eslint-plugin/recommended-with-formatting' ],
	rules: {
		camelcase: 'off',
		'no-console': 'off',
		'no-alert': 'off',
		'space-before-function-paren': 'off',
		'no-mixed-spaces-and-tabs': 'off',
	},
	parserOptions: {
		requireConfigFile: false,
	},
	globals: {
		alert: true,
		confirm: true,
		jQuery: true,
		module: true,
		location: true,
		spectraOne: true,
	},
};

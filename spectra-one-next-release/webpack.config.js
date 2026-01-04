const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );

module.exports = () => {
	return {
		...defaultConfig,

		module: {
			...defaultConfig.module,
		},

		entry: {
			script: './src/script.js',
			editor: './src/editor.js',
			welcome_notice: './src/admin/welcome-notice.js',
		},

		plugins: [ ...defaultConfig.plugins ],
	};
};

module.exports = function ( grunt ) {
	'use strict';

	// Project configuration.
	const autoprefixer = require( 'autoprefixer' );
	const sass = require( 'sass' );
	const pkgInfo = grunt.file.readJSON( 'package.json' );

	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),

		sass: {
			options: {
				implementation: sass,
				sourcemap: 'none',
				outputStyle: 'expanded',
				linefeed: 'lf',
			},
			dist: {
				files: [
					/* Common Style */
					{
						expand: true,
						cwd: 'sass/',
						src: [ '**.scss' ],
						dest: 'assets/css/unminified',
						ext: '.css',
					},

					/* Compatibility */
					{
						expand: true,
						cwd: 'sass/compatibility/',
						src: [ '**.scss' ],
						dest: 'assets/css/unminified/compatibility',
						ext: '.css',
					},

					/* Admin */
					{
						expand: true,
						cwd: 'sass/admin/',
						src: [ '**.scss' ],
						dest: 'assets/css/unminified/admin',
						ext: '.css',
					},
				],
			},
		},

		postcss: {
			options: {
				map: false,
				processors: [
					autoprefixer( {
						browsers: [
							'> 1%',
							'ie >= 11',
							'last 1 Android versions',
							'last 1 ChromeAndroid versions',
							'last 2 Chrome versions',
							'last 2 Firefox versions',
							'last 2 Safari versions',
							'last 2 iOS versions',
							'last 2 Edge versions',
							'last 2 Opera versions',
						],
						cascade: false,
					} ),
				],
			},
			style: {
				expand: true,
				src: [
					'assets/css/unminified/style.css',
					'assets/css/unminified/*.css',
					'assets/css/unminified/compatibility/*.css',
				],
			},
		},

		rtlcss: {
			options: {
				// rtlcss options
				config: {
					preserveComments: true,
					greedy: true,
				},
				// generate source maps
				map: false,
			},
			dist: {
				files: [
					{
						expand: true,
						cwd: 'assets/css/unminified/',
						src: [ '*.css', '!*-rtl.css' ],
						dest: 'assets/css/unminified',
						ext: '-rtl.css',
					},
					{
						expand: true,
						cwd: 'assets/css/unminified/compatibility',
						src: [ '*.css', '!*-rtl.css' ],
						dest: 'assets/css/unminified/compatibility',
						ext: '-rtl.css',
					},
					{
						expand: true,
						cwd: 'assets/css/unminified/admin',
						src: [ '*.css', '!*-rtl.css' ],
						dest: 'assets/css/unminified/admin',
						ext: '-rtl.css',
					},
					{
						expand: true,
						cwd: 'inc/assets/css',
						src: [ '*.css', '!*-rtl.css' ],
						dest: 'inc/assets/css',
						ext: '-rtl.css',
					},
				],
			},
		},

		clean: {
			main: [ 'spectra-one' ],
			zip: [ '*.zip' ],
		},

		copy: {
			main: {
				options: {
					mode: true,
				},
				src: [
					'**',
					'!node_modules/**',
					'!build/**',
					'!css/sourcemap/**',
					'!.git/**',
					'!.github/**',
					'!bin/**',
					'!docs/**',
					'!psalm.xml',
					'!tests/**',
					'!contributing.md',
					'!.gitlab-ci.yml',
					'!cghooks.lock',
					'!tests/**',
					'!phpunit.xml.dist',
					'!*.sh',
					'!*.scss',
					'!*.map',
					'!Gruntfile.js',
					'!package.json',
					'!.gitignore',
					'!phpunit.xml',
					'!README.md',
					'!artifacts',
					'!sass/**',
					'!codesniffer.ruleset.xml',
					'!vendor/**',
					'!composer.json',
					'!composer.lock',
					'!package-lock.json',
					'!phpcs.xml.dist',
					'!assets/css/unminified/**',
					'!webpack.config.js',
					'!src/**',
					'!psalm/**',
				],
				dest: 'spectra-one/',
			},
		},

		bumpup: {
			options: {
				updateProps: {
					pkg: 'package.json',
				},
			},
			file: 'package.json',
		},

		replace: {
			theme_main: {
				src: [ 'style.css' ],
				overwrite: true,
				replacements: [
					{
						from: /Version: \bv?(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[\da-z-A-Z-]+(?:\.[\da-z-A-Z-]+)*)?(?:\+[\da-z-A-Z-]+(?:\.[\da-z-A-Z-]+)*)?\b/g,
						to: 'Version: <%= pkg.version %>',
					},
				],
			},
		},

		compress: {
			main: {
				options: {
					archive: 'spectra-one.' + pkgInfo.version + '.zip',
					mode: 'zip',
				},
				files: [
					{
						src: [ './spectra-one/**' ],
					},
				],
			},
		},
		cssmin: {
			options: {
				keepSpecialComments: 0,
			},
			css: {
				files: [
					// Generated '.min.css' files from '.css' files.
					// NOTE: Avoided '-rtl.css' files.
					{
						expand: true,
						src: [ '**/*.css', '!**/*-rtl.css' ],
						dest: 'assets/css/minified',
						cwd: 'assets/css/unminified',
						ext: '.min.css',
					},

					// Generating RTL files from '/unminified/' into '/minified/'
					// NOTE: Not possible to generate bulk .min-rtl.css files from '.min.css'
					{
						src: 'assets/css/unminified/style-rtl.css',
						dest: 'assets/css/minified/style.min-rtl.css',
					},
					{
						src: 'assets/css/unminified/editor-rtl.css',
						dest: 'assets/css/minified/editor.min-rtl.css',
					},
					{
						src: 'assets/css/unminified/gutenberg-rtl.css',
						dest: 'assets/css/minified/gutenberg.min-rtl.css',
					},
					{
						src: 'assets/css/unminified/gutenberg-editor-rtl.css',
						dest: 'assets/css/minified/gutenberg-editor.min-rtl.css',
					},
					{
						src: 'assets/css/unminified/compatibility/woocommerce-rtl.css',
						dest: 'assets/css/minified/compatibility/woocommerce.min-rtl.css',
					},
					{
						src: 'assets/css/unminified/admin/welcome-notice-rtl.css',
						dest: 'assets/css/minified/admin/welcome-notice.min-rtl.css',
					},
				],
			},
		},

		uglify: {
			js: {
				files: [
					{
						// all .js to min.js
						expand: true,
						src: [ '**.js' ],
						dest: 'assets/js/minified',
						cwd: 'assets/js/unminified',
						ext: '.min.js',
					},
				],
			},
		},
	} );

	// Load grunt tasks
	grunt.loadNpmTasks( 'grunt-rtlcss' );
	grunt.loadNpmTasks( 'grunt-sass' );
	grunt.loadNpmTasks( '@lodder/grunt-postcss' );
	grunt.loadNpmTasks( 'grunt-contrib-cssmin' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks( 'grunt-contrib-concat' );
	grunt.loadNpmTasks( 'grunt-contrib-copy' );
	grunt.loadNpmTasks( 'grunt-contrib-compress' );
	grunt.loadNpmTasks( 'grunt-contrib-clean' );
	grunt.loadNpmTasks( 'grunt-bumpup' );
	grunt.loadNpmTasks( 'grunt-text-replace' );

	// rtlcss, you will still need to install ruby and sass on your system manually to run this
	grunt.registerTask( 'rtl', [ 'rtlcss' ] );

	// SASS compile
	grunt.registerTask( 'scss', [ 'sass' ] );

	// Style
	grunt.registerTask( 'style', [ 'scss', 'postcss:style', 'rtl' ] );

	// min all
	grunt.registerTask( 'minify', [ 'style', 'uglify:js', 'cssmin:css' ] );

	// Bump Version - `grunt version-bump --ver=<version-number>`
	grunt.registerTask( 'version-bump', function () {
		let newVersion = grunt.option( 'ver' );

		if ( newVersion ) {
			newVersion = newVersion ? newVersion : 'patch';

			grunt.task.run( 'bumpup:' + newVersion );
			grunt.task.run( 'replace' );
		}
	} );

	// Grunt release - Create installable package of the local files
	grunt.registerTask( 'release', [
		'clean:zip',
		'copy:main',
		'compress:main',
		'clean:main',
	] );

	// Grunt release no clean
	grunt.registerTask( 'release-no-clean', [
		'clean:main',
		'clean:zip',
		'copy:main',
	] );

	grunt.util.linefeed = '\n';
};

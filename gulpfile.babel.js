import gulp from 'gulp'
import watch from 'gulp-watch'
import uglify from 'gulp-uglify'
import sass from 'gulp-sass'
import sourcemaps from 'gulp-sourcemaps'
import rigger from 'gulp-rigger'
import rimraf from 'rimraf'
import browserSync from 'browser-sync'
import tinypng from 'gulp-tinypng-nokey'
import runSequence from 'run-sequence'
import flexbugsFixes from 'postcss-flexbugs-fixes'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import postCSS from 'gulp-postcss'
import _if from 'gulp-if'
import svgmin from 'gulp-svgmin'
import htmlmin from 'gulp-htmlmin'
import size from 'gulp-size'


const reload = browserSync.reload

/* * * * * * * * * *
 *	Gulpfile config
 * * * * * * * * * */

// Mode: enable compress css/js and optimize images
const isProduction = false

const dirs = {
	src: 'src',
	dest: 'build'
}

// Paths
const paths = {
	dest: {
		html: `${dirs.dest}/`,
		js: `${dirs.dest}/assets/js/`,
		styles: `${dirs.dest}/assets/styles/`,
		images: `${dirs.dest}/assets/images/`,
		fonts: `${dirs.dest}/assets/fonts/`
	},
	src: {
		html: `${dirs.src}/**/*.html`,
		js: `${dirs.src}/assets/js/main.js`,
		styles: `${dirs.src}/assets/styles/main.scss`,
		images: {
			all: `${dirs.src}/assets/images/**/*.*`,
			svg: `${dirs.src}/assets/images/**/*.svg`,
			basic: `${dirs.src}/assets/images/**/*.{jpg,jpeg,png}`
		},
		fonts: `${dirs.src}/assets/fonts/**/*.{eot,ttf,woff,woff2,svg}`
	},
	watch: {
		html: `${dirs.src}/**/*.html`,
		js: `${dirs.src}/assets/js/**/*.js`,
		styles: `${dirs.src}/assets/styles/**/*.scss`,
		images: `${dirs.src}/assets/images/**/*.*`,
		fonts: `${dirs.src}/assets/fonts/**/*.{eot,ttf,woff,woff2,svg}`
	},
	clean: `./${dirs.dest}`
}

// Plugins
const plugins = {
	htmlmin: {collapseWhitespace: true},
	uglify: {
		mangle: true,
		compress: {
			sequences: true,
			dead_code: true,
			conditionals: true,
			booleans: true,
			unused: true,
			if_return: true,
			join_vars: true,
			drop_console: true
		}
	},
	sass: {
		sourceMap: !isProduction,
		errLogToConsole: true
	},
	postCSS: [
		flexbugsFixes(),
		autoprefixer({
			browsers: ['last 2 versions', 'ie >= 11', 'Opera 12.1', 'Android 4', 'Firefox ESR', 'iOS >= 8', 'Safari >= 8'],
			cascade: false
		}),
		cssnano({
			autoprefixer: false,
			discardUnused: true,
			mergeIdents: true,
			reduceIdents: false,
			zindex: false
		})
	],
	svgmin: {
		plugins: [
			{removeDoctype: true},
			{removeComments: true},
			{removeXMLProcInst: true},
			{removeMetadata: true},
			{removeTitle: true},
			{removeHiddenElems: true},
			{removeEmptyText: true},
			{removeViewBox: true},
			{convertStyleToAttrs: true},
			{minifyStyles: true},
			{cleanupIDs: true},
			{removeRasterImages: true},
			{removeUselessDefs: true},
			{cleanupListOfValues: true},
			{cleanupNumericValues: true},
			{convertColors: true},
			{removeUnknownsAndDefaults: true},
			{removeNonInheritableGroupAttrs: true},
			{removeUselessStrokeAndFill: true},
			{cleanupEnableBackground: true},
			{convertShapeToPath: true},
			{moveElemsAttrsToGroup: true},
			{moveGroupAttrsToElems: true},
			{collapseGroups: true},
			{convertPathData: true},
			{convertTransform: true},
			{removeEmptyAttrs: true},
			{removeEmptyContainers: true},
			{mergePaths: true},
			{removeUnusedNS: true},
			{sortAttrs: true},
			{removeDesc: true},
			{removeDimensions: true},
			{removeStyleElement: true},
			{removeScriptElement: true},
		]
	}
}

// BrowserSync config
const bsConfig = {
	server: {
		baseDir: `./${dirs.dest}`
	},
	notify: false,
	ghostMode: false,
	host: 'localhost',
	port: 9000,
	logPrefix: 'markup-boilerplate'
}

/* * * * * * * * * *
 *	Gulpfile tasks
 * * * * * * * * * */

//------------------------------------------------------------ Helpers
// Init BrowserSync
gulp.task('browserSync', () => {
	browserSync(bsConfig)
})

// Clean build folder
gulp.task('clean', (cb) => {
	rimraf(paths.clean, cb)
})

//------------------------------------------------------------ HTML
gulp.task('html:build', () => {
	gulp.src(paths.src.html)
		.pipe(rigger())
		.pipe(_if(isProduction, htmlmin(plugins.htmlmin)))
		.pipe(size({showFiles: true}))
		.pipe(gulp.dest(paths.dest.html))
		.pipe(reload({stream: true}))
})

//------------------------------------------------------------ JS
gulp.task('js:build', () => {
	gulp.src(paths.src.js)
		.pipe(rigger())
		.pipe(_if(!isProduction, sourcemaps.init()))
		.pipe(_if(isProduction, uglify(plugins.uglify)))
		.pipe(_if(!isProduction, sourcemaps.write()))
		.pipe(size({showFiles: true}))
		.pipe(gulp.dest(paths.dest.js))
		.pipe(reload({stream: true}))
})

//------------------------------------------------------------ Styles
gulp.task('styles:build', () => {
	gulp.src(paths.src.styles)
		.pipe(_if(!isProduction, sourcemaps.init()))
		.pipe(sass(plugins.sass))
		.pipe(_if(isProduction, postCSS(plugins.postCSS)))
		.pipe(_if(!isProduction, sourcemaps.write()))
		.pipe(size({showFiles: true}))
		.pipe(gulp.dest(paths.dest.styles))
		.pipe(reload({stream: true}))
})

//------------------------------------------------------------ Images
// SVG
gulp.task('images:svg', () => {
	return gulp.src(paths.src.images.svg)
		.pipe(_if(isProduction, svgmin(plugins.svgmin)))
		.pipe(gulp.dest(paths.dest.images))
})

// JPG, JPEG, PNG
gulp.task('images:basic', () => {
	return gulp.src(paths.src.images.basic)
		.pipe(_if(isProduction, tinypng()))
		.pipe(gulp.dest(paths.dest.images))
})

gulp.task('images:build', ['images:svg', 'images:basic'])

//------------------------------------------------------------ Fonts
gulp.task('fonts:build', () => {
	gulp.src(paths.src.fonts)
		.pipe(gulp.dest(paths.dest.fonts))
})

//------------------------------------------------------------ General tasks
gulp.task('watch', () => {
	watch([paths.watch.html], (event, cb) => {
		gulp.start('html:build')
	})
	watch([paths.watch.styles], (event, cb) => {
		gulp.start('styles:build')
	})
	watch([paths.watch.js], (event, cb) => {
		gulp.start('js:build')
	})
	watch([paths.watch.images], (event, cb) => {
		gulp.start('images:build')
	})
	watch([paths.watch.fonts], (event, cb) => {
		gulp.start('fonts:build')
	})
})

gulp.task('build', (cb) => {
	runSequence('clean', 'html:build', 'js:build', 'styles:build', 'fonts:build', 'images:build', cb)
})

gulp.task('default', (cb) => {
	runSequence('build', 'browserSync', 'watch', cb)
})

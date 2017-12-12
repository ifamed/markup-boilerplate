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

const reload = browserSync.reload

/* * * * * * * * * *
 *	Gulpfile config
 * * * * * * * * * */

const isProduction = false; // compress css/js, optimize images

const dirs = {
	src: 'src',
	dest: 'build'
}

// Paths
const paths = {
	dest: {
		html: `${dirs.dest}/`,
		javascripts: `${dirs.dest}/assets/javascripts/`,
		stylesheets: `${dirs.dest}/assets/stylesheets/`,
		images: `${dirs.dest}/assets/images/`,
		fonts: `${dirs.dest}/assets/fonts/`
	},
	src: {
		html: `${dirs.src}/*.html`,
		javascripts: `${dirs.src}/assets/javascripts/main.js`,
		stylesheets: `${dirs.src}/assets/stylesheets/main.scss`,
		images: `${dirs.src}/assets/images/**/*.*`,
		fonts: `${dirs.src}/assets/fonts/**/*.*`
	},
	watch: {
		html: `${dirs.src}/**/*.html`,
		javascripts: `${dirs.src}/assets/javascripts/**/*.js`,
		stylesheets: `${dirs.src}/assets/stylesheets/**/*.scss`,
		images: `${dirs.src}/assets/images/**/*.*`,
		fonts: `${dirs.src}/assets/fonts/**/*.*`
	},
	clean: `./${dirs.dest}`
}

// BrowserSync config
var config = {
	server: {
		baseDir: `./${dirs.dest}`
	},
	tunnel: true,
	host: 'localhost',
	port: 9000,
	logPrefix: 'markup-boilerplate'
}

/* * * * * * * * * *
 *	Gulpfile tasks
 * * * * * * * * * */

// Init BrowserSync
gulp.task('webserver', () => {
	browserSync(config)
})

// Clean build folder
gulp.task('clean', (cb) => {
	rimraf(paths.clean, cb)
})

// HTML
gulp.task('html:build', () => {
	gulp.src(paths.src.html)
		.pipe(rigger())
		.pipe(gulp.dest(paths.dest.html))
		.pipe(reload({stream: true}))
})

// Javascripts
gulp.task('javascripts:build', () => {
	gulp.src(paths.src.javascripts)
		.pipe(rigger())
		.pipe(_if(!isProduction, sourcemaps.init()))
		.pipe(_if(isProduction, uglify({
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
		})))
		.pipe(_if(!isProduction, sourcemaps.write()))
		.pipe(gulp.dest(paths.dest.javascripts))
		.pipe(reload({stream: true}))
})

// Stylesheets
gulp.task('stylesheets:build', () => {
	gulp.src(paths.src.stylesheets)
		.pipe(_if(!isProduction, sourcemaps.init()))
		.pipe(sass({
			sourceMap: !isProduction,
			errLogToConsole: true
		}))
		.pipe(_if(isProduction, postCSS([
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
		])))
		.pipe(_if(!isProduction, sourcemaps.write()))
		.pipe(gulp.dest(paths.dest.stylesheets))
		.pipe(reload({stream: true}))
})

// Images (local optimization)
// gulp.task('images:build', () => {
// 	gulp.src(paths.src.images)
// 		.pipe(imagemin([
// 			imagemin.gifsicle({interlaced: true}),
// 			imagemin.jpegtran({progressive: true}),
// 			imagemin.optipng({optimizationLevel: 7}),
// 			imagemin.svgo({plugins: [{removeViewBox: false}]})
// 		]))
// 		.pipe(gulp.dest(paths.dest.images))
// 		.pipe(reload({stream: true}))
// })

// Images (remote optimization)
gulp.task('images:build', () => {
	return gulp.src(paths.src.images)
		.pipe(_if(isProduction, tinypng()))
		.pipe(gulp.dest(paths.dest.images))
})

// Fonts
gulp.task('fonts:build', () => {
	gulp.src(paths.src.fonts)
		.pipe(gulp.dest(paths.dest.fonts))
})

// Build
gulp.task('build', (cb) => {
	runSequence('clean', 'html:build', 'javascripts:build', 'stylesheets:build', 'fonts:build', 'images:build', cb)
})

// Source watchers
gulp.task('watch', () => {
	watch([paths.watch.html], (event, cb) => {
		gulp.start('html:build')
	})
	watch([paths.watch.stylesheets], (event, cb) => {
		gulp.start('stylesheets:build')
	})
	watch([paths.watch.javascripts], (event, cb) => {
		gulp.start('javascripts:build')
	})
	watch([paths.watch.images], (event, cb) => {
		gulp.start('images:build')
	})
	watch([paths.watch.fonts], (event, cb) => {
		gulp.start('fonts:build')
	})
})

gulp.task('default', (cb) => {
	runSequence('build', 'webserver', 'watch', cb)
})

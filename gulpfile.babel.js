'use strict';

import gulp from 'gulp'
import watch from 'gulp-watch'
import prefixer from 'gulp-autoprefixer'
import uglify from 'gulp-uglify'
import sass from 'gulp-sass'
import sourcemaps from 'gulp-sourcemaps'
import rigger from 'gulp-rigger'
import cssmin from 'gulp-minify-css'
import imagemin from 'gulp-imagemin'
import pngquant from 'imagemin-pngquant'
import rimraf from 'rimraf'
import browserSync from 'browser-sync'

const reload = browserSync.reload

/* * * * * * * * * *
 *	Gulpfile config
 * * * * * * * * * */

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
		stylesheets: `${dirs.src}/assets/stylesheets/main.(sass|scss)`,
		images: `${dirs.src}/assets/images/**/*.*`,
		fonts: `${dirs.src}/assets/fonts/**/*.*`
	},
	watch: {
		html: `${dirs.src}/**/*.html`,
		javascripts: `${dirs.src}/assets/javascripts/**/*.js`,
		stylesheets: `${dirs.src}/assets/stylesheets/**/*.(sass|scss)`,
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
};

/* * * * * * * * * *
 *	Gulpfile tasks
 * * * * * * * * * */

// Init BrowserSync
gulp.task('webserver', function () {
	browserSync(config);
});

// Clean build folder
gulp.task('clean', function (cb) {
	rimraf(paths.clean, cb);
});

// HTML
gulp.task('html:build', function () {
	gulp.src(paths.src.html)
		.pipe(rigger())
		.pipe(gulp.dest(paths.dest.html))
		.pipe(reload({ stream: true }));
});

// Javascripts
gulp.task('js:build', function () {
	gulp.src(paths.src.javascripts)
		.pipe(rigger())
		.pipe(sourcemaps.init())
		.pipe(uglify())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(paths.dest.javascripts))
		.pipe(reload({ stream: true }));
});

// Stylesheets
gulp.task('style:build', function () {
	gulp.src(paths.src.stylesheets)
		.pipe(sourcemaps.init())
		.pipe(sass({
			sourceMap: true,
			errLogToConsole: true
		}))
		.pipe(prefixer())
		.pipe(cssmin())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(paths.dest.stylesheets))
		.pipe(reload({ stream: true }));
});

// Images
gulp.task('image:build', function () {
	gulp.src(paths.src.images)
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{ removeViewBox: false }],
			use: [pngquant()],
			interlaced: true
		}))
		.pipe(gulp.dest(paths.dest.images))
		.pipe(reload({ stream: true }));
});

// Fonts
gulp.task('fonts:build', function () {
	gulp.src(paths.src.fonts)
		.pipe(gulp.dest(paths.dest.fonts))
});

// Build
gulp.task('build', [
	'html:build',
	'js:build',
	'style:build',
	'fonts:build',
	'image:build'
]);

// Source watchers
gulp.task('watch', function () {
	watch([paths.watch.html], function (event, cb) {
		gulp.start('html:build');
	});
	watch([paths.watch.stylesheets], function (event, cb) {
		gulp.start('style:build');
	});
	watch([paths.watch.javascripts], function (event, cb) {
		gulp.start('js:build');
	});
	watch([paths.watch.images], function (event, cb) {
		gulp.start('image:build');
	});
	watch([paths.watch.fonts], function (event, cb) {
		gulp.start('fonts:build');
	});
});

gulp.task('default', ['build', 'webserver', 'watch']);

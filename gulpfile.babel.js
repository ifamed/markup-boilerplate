import gulp from 'gulp'
import util from 'gulp-util'
import del from 'del'
import browserSync from 'browser-sync'
import _if from 'gulp-if'
import sourcemaps from 'gulp-sourcemaps'
import sass from 'gulp-sass'
import rigger from 'gulp-rigger'
import flexbugsFixes from 'postcss-flexbugs-fixes'
import autoprefixer from 'autoprefixer'
import postCSS from 'gulp-postcss'
import tinypng from 'gulp-tinypng-nokey'
import buffer from 'vinyl-buffer'
import size from 'gulp-size'
import svgmin from 'gulp-svgmin'
import uglify from 'gulp-uglify'
import csso from 'postcss-csso'
import notifier from 'node-notifier'
import htmlmin from 'gulp-htmlmin'
import svgSprite from 'gulp-svg-sprite'
import spritesmith from 'gulp.spritesmith'
import merge from 'merge-stream'
import folders from 'gulp-folders'

// ENV
// util.env.production or util.env.prod
// util.env.development or util.env.dev
// util.env.open
util.env.production = util.env.production || util.env.prod;
util.env.development = util.env.development || util.env.dev;

//------------------------------------------------------------ Config

const project = {
	name: 'markup-boilerplate',
	src: './src/',
	dest: './dest/'
};

const
	syncOptions = {
		server: {
			baseDir: project.dest
		},
		files: `${project.dest}/**/*.*`,
		open: util.env.open,
		notify: false,
		port: 9000,
		logPrefix: project.name
	},
	plugins = {
		postCSS: [
			flexbugsFixes(),
			autoprefixer({
				browsers: ['last 4 versions', '> 1%', 'ie >= 11', 'opera >= 23', 'android >= 4', 'ff >= 30', 'ios >= 8', 'safari >= 8'],
				cascade: false
			}),
			csso
		],
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
				{removeScriptElement: true}
			]
		},
		htmlmin: {collapseWhitespace: true}
	};

const paths = {
	project: {
		build: {
			html: project.dest,
			js: `${project.dest}/assets/js/`,
			styles: `${project.dest}/assets/css/`,
			fonts: `${project.dest}/assets/fonts/`,
			images: `${project.dest}/images/`,
			sprites: {
				png: `${project.dest}/images/`,
				svg: {
					styles: `${project.src}/assets/scss/sprites/sprites-svg.scss`
				}
			}
		},
		src: {
			html: `${project.src}/**/*.html`,
			js: `${project.src}/assets/js/main.js`,
			styles: `${project.src}/assets/scss/main.scss`,
			fonts: `${project.src}/assets/fonts/**/*.*`,
			images: `${project.src}/images/**/*.*`,
			sprites: {
				scss: `${project.src}/assets/scss/sprites/`,
				png: {
					images: `${project.src}/images/sprites`,
					template: `${project.src}/assets/scss/sprites/tpl/sprites-png-template.handlebars`
				},
				svg: {
					images: `${project.src}/images/sprites`,
					template: `${project.src}/assets/scss/sprites/tpl/sprites-svg-template.scss`
				},
			}
		},
		watch: {
			html: `${project.src}/**/*.html`,
			js: `${project.src}/assets/js/**/*.js`,
			styles: `${project.src}/assets/scss/**/*.scss`,
			fonts: `${project.src}/assets/fonts/**/*.*`,
			images: `${project.src}/images/**/*.*`,
			sprites: {
				png: `${project.src}/images/sprites/**/*.png`,
				svg: `${project.src}/images/sprites/**/*.svg*`
			}
		}
	},
	clean: project.dest
};

//------------------------------------------------------------ HTML
gulp.task('html', () =>
	gulp.src(paths.project.src.html)
		.pipe(rigger().on('error', handleErrors))
		.pipe(_if(util.env.development, htmlmin(plugins.htmlmin).on('error', handleErrors)))
		.pipe(size({showFiles: true, title: 'html'}))
		.pipe(gulp.dest(paths.project.build.html))
);

//------------------------------------------------------------ JS

gulp.task('js', () => handleJS(paths.project.src.js, paths.project.build.js, 'js'));

function handleJS(src, build, title) {
	return gulp.src(src)
		.pipe(rigger().on('error', handleErrors))
		.pipe(_if(util.env.development, sourcemaps.init()))
		.pipe(_if(util.env.production, uglify(plugins.uglify).on('error', handleErrors)))
		.pipe(_if(util.env.development, sourcemaps.write()))
		.pipe(size({showFiles: true, title: title}))
		.pipe(gulp.dest(build));
}

//------------------------------------------------------------ Styles

gulp.task('styles', () => handleStyles(paths.project.src.styles, paths.project.build.styles, 'styles'));

function handleStyles(src, build, title) {
	return gulp.src(src)
		.pipe(_if(util.env.development, sourcemaps.init()))
		.pipe(sass({
			includePaths: [src],
			outputStyle: util.env.production ? 'compact' : 'expanded',
			precision: 5,
			sourceMap: util.env.development,
			errLogToConsole: true
		}).on('error', handleErrors))
		.pipe(_if(util.env.production, postCSS(plugins.postCSS)))
		.pipe(_if(util.env.development, sourcemaps.write()))
		.pipe(size({showFiles: true, title: title}))
		.pipe(gulp.dest(build));
}

//------------------------------------------------------------ Fonts

gulp.task('fonts', () =>
	gulp.src(paths.project.src.fonts)
		.pipe(gulp.dest(paths.project.build.fonts))
);

//------------------------------------------------------------ Images

gulp.task('images:tinypng', () =>
	gulp.src([`${project.src}/images/**/*.{jpg,jpeg,png}`, `!${project.src}/images/sprites`, `!${project.src}/images/sprites/**`])
		.pipe(_if(util.env.production, tinypng()))
		.pipe(gulp.dest(paths.project.build.images))
);

gulp.task('images:svg', () =>
	gulp.src([`${project.src}/images/**/*.svg`, `!${project.src}/images/sprites`, `!${project.src}/images/sprites/**`])
		.pipe(_if(util.env.production, svgmin(plugins.svgmin)))
		.pipe(gulp.dest(paths.project.build.images))
);

gulp.task('images', gulp.parallel('images:tinypng', 'images:svg'));

//------------------------------------------------------------ Sprites

gulp.task('sprites-png', folders(paths.project.src.sprites.png.images, (folder) => {
	const spriteData = gulp.src(`${paths.project.src.sprites.png.images}/${folder}/*.{png,jpg}`)
		.pipe(buffer())
		.pipe(spritesmith({
			imgName: `sprites-${folder}.png`,
			cssName: `sprites-${folder}.scss`,
			cssFormat: 'scss',
			algorithm: 'binary-tree',
			padding: 10,
			cssTemplate: paths.project.src.sprites.png.template,
			cssVarMap: function(sprite) {
				sprite.name = `${folder}-${sprite.name}`
			}
		}));
	const imgStream = spriteData.img
		.pipe(buffer())
		.pipe(_if(util.env.production, tinypng()))
		.pipe(gulp.dest(paths.project.build.sprites.png));
	const cssStream = spriteData.css
		.pipe(gulp.dest(paths.project.src.sprites.scss));
	return merge(imgStream, cssStream);
}));

gulp.task('sprites-svg', () =>
	gulp.src(paths.project.watch.sprites.svg)
		.pipe(_if(util.env.production, svgmin()))
		.pipe(svgSprite({
			mode: {
				variables: {mapname: 'icons'},
				css: {
					dest: './',
					layout: 'horizontal',
					sprite: `${project.dest}/images/sprites-svg.svg`,
					bust: false,
					render: {
						scss: {
							dest: paths.project.build.sprites.svg.styles,
							template: paths.project.src.sprites.svg.template
						}
					}
				}
			}
		}))
		.pipe(gulp.dest('./'))
);

//------------------------------------------------------------ Watch

gulp.task('watch', () => {
	gulp.watch(paths.project.watch.html)
		.on('add', gulp.series('clean', 'html'))
		.on('change', gulp.series('clean', 'html'))
		.on('unlink', gulp.series('clean', 'html'));

	gulp.watch(paths.project.watch.js)
		.on('add', gulp.series('clean', 'js'))
		.on('change', gulp.series('clean', 'js'))
		.on('unlink', gulp.series('clean', 'js'));

	gulp.watch(paths.project.watch.styles)
		.on('add', gulp.parallel('styles'))
		.on('change', gulp.parallel('styles'))
		.on('unlink', gulp.parallel('styles'));

	gulp.watch(paths.project.watch.fonts)
		.on('add', gulp.series('clean', 'fonts'))
		.on('change', gulp.series('clean', 'fonts'))
		.on('unlink', gulp.series('clean', 'fonts'));

	gulp.watch(paths.project.watch.images)
		.on('add', gulp.series('clean', 'images'))
		.on('change', gulp.series('clean', 'images'))
		.on('unlink', gulp.series('clean', 'images'));
});

//------------------------------------------------------------ Other

function handleErrors(e) {
	notifier.notify({
		// icon: project.dest + '/favicon.png',
		title: project.name + ': ' + e.name,
		message: e.message,
		sound: true,
		open: e.file
	});
	this.end();
}

gulp.task('browserSync', () => browserSync(syncOptions));

gulp.task('clean', () => del(paths.clean));

gulp.task('general', gulp.parallel('html', 'fonts', 'styles', 'js'));

gulp.task('production', gulp.parallel('clean', 'general', 'images'));

gulp.task('default', gulp.series('browserSync', 'watch'));
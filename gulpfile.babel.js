const gulp = require('gulp');
const del = require('del');
const browserSync = require('browser-sync');
const _if = require('gulp-if');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const rigger = require('gulp-rigger');
const flexbugsFixes = require('postcss-flexbugs-fixes');
const autoprefixer = require('autoprefixer');
const postCSS = require('gulp-postcss');
const tinypng = require('gulp-tinypng-nokey');
const buffer = require('vinyl-buffer');
const size = require('gulp-size');
const svgmin = require('gulp-svgmin');
const uglify = require('gulp-uglify');
const csso = require('postcss-csso');
const notifier = require('node-notifier');
const svgSprite = require('gulp-svg-sprite');
const spritesmith = require('gulp.spritesmith');
const merge = require('merge-stream');
const folders = require('gulp-folders');
const easyImport = require('postcss-easy-import');
const babel = require('gulp-babel');
const argv = require('minimist')(process.argv.slice(2));
const htmlmin = require('gulp-htmlmin');
const path = require('path');
const fs = require('fs');

// ENV
// argv.production or argv.prod
// argv.development or argv.dev
// argv.open (in CL 'gulp --open' to open current project in browser)
// argv.tunnel (in CL 'gulp --tunnel projectName' to make project available over https://projectName.localtunnel.me)
argv.production = Boolean(argv.production) || Boolean(argv.prod);
argv.development = Boolean(argv.development) || Boolean(argv.dev);

//------------------------------------------------------------ Config

const project = {
    name: 'markup-boilerplate',
    src: './src',
    dest: './dest',
    filenames: {
        styles: 'style',
        js: 'main'
    }
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
            js: `${project.src}/assets/js/${project.filenames.js}.js`,
            styles: `${project.src}/assets/scss/${project.filenames.styles}.scss`,
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
                }
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
    }
};

paths.clean = [
    `${paths.project.build.js}${project.filenames.js}.js`,
    `${paths.project.build.styles}${project.filenames.styles}.css`,
    `${paths.project.build.fonts}*`,
    `${paths.project.build.images}*`
];

const
    syncOptions = {
        server: {
            baseDir: project.dest
        },
        port: 3000,
        files: [
            `${paths.project.build.html}**/*.html`,
            `${paths.project.build.js}${project.filenames.js}.js`,
            `${paths.project.build.styles}${project.filenames.styles}.css`,
            `${paths.project.build.fonts}**/*`,
            `${paths.project.build.images}**/*`
        ],
        open: Boolean(argv.open),
        online: Boolean(argv.tunnel),
        tunnel: argv.tunnel || null,
        logPrefix: project.name,
        notify: false,
        ghostMode: false,
        logLevel: 'info', // 'debug', 'info', 'silent', 'warn'
        logConnections: false,
        logFileChanges: true,
        timestamps: true,
        injectChanges: true,
        fileTimeout: 1000,
        reloadDelay: 500
    },
    plugins = {
        postCSS: {
            production: [
                easyImport(),
                flexbugsFixes(),
                autoprefixer({
                    browsers: ['last 4 versions', '> 1%', 'ie >= 11', 'opera >= 23', 'android >= 4', 'ff >= 30', 'ios >= 8', 'safari >= 8'],
                    cascade: false
                }),
                csso(_if(argv.production, {comments: false}))
            ],
            development: [
                easyImport()
            ]
        },
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

//------------------------------------------------------------ HTML
gulp.task('html', () =>
    gulp.src(paths.project.src.html)
        .pipe(rigger().on('error', handleErrors))
        .pipe(_if(argv.production, htmlmin(plugins.htmlmin).on('error', handleErrors)))
        .pipe(size({showFiles: true, title: 'html'}))
        .pipe(gulp.dest(paths.project.build.html))
);

//------------------------------------------------------------ JS

gulp.task('js', () => handleJS(paths.project.src.js, paths.project.build.js, 'js'));

function handleJS(src, build, title) {
    return gulp.src(src)
        .pipe(rigger().on('error', handleErrors))
        .pipe(_if(argv.development, sourcemaps.init()))
        // .pipe(babel({
        //     presets: ['@babel/preset-env']
        // }))
        .pipe(_if(argv.production, uglify(plugins.uglify).on('error', handleErrors)))
        .pipe(_if(argv.development, sourcemaps.write()))
        .pipe(size({showFiles: true, title: title}))
        .pipe(gulp.dest(build));
}

//------------------------------------------------------------ Styles

gulp.task('styles', () => handleStyles(paths.project.src.styles, paths.project.build.styles, 'styles'));

function handleStyles(src, build, title) {
    return gulp.src(src)
        .pipe(_if(argv.development, sourcemaps.init()))
        .pipe(sass({
            includePaths: [src],
            outputStyle: argv.production ? 'compact' : 'expanded',
            precision: 5,
            sourceMap: argv.development,
            errLogToConsole: true
        }).on('error', handleErrors))
        .pipe(_if(argv.production, postCSS(plugins.postCSS.production), postCSS(plugins.postCSS.development)))
        .pipe(_if(argv.development, sourcemaps.write()))
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
        .pipe(_if(argv.production, tinypng()))
        .pipe(gulp.dest(paths.project.build.images))
);

gulp.task('images:svg', () =>
    gulp.src([`${project.src}/images/**/*.svg`, `!${project.src}/images/sprites`, `!${project.src}/images/sprites/**`])
        .pipe(_if(argv.production, svgmin(plugins.svgmin)))
        .pipe(gulp.dest(paths.project.build.images))
);

gulp.task('images:other', () =>
    gulp.src([`${project.src}/assets/images/**/*.gif`, `!${project.src}/assets/images/sprites`, `!${project.src}/assets/images/sprites/**`])
        .pipe(gulp.dest(paths.project.build.images))
);

gulp.task('images', gulp.parallel('images:tinypng', 'images:svg', 'images:other'));

//------------------------------------------------------------ Sprites

gulp.task('sprites-png', folders(paths.project.src.sprites.png.images, (folder) => {
    let spritesPositions = [];
    const spriteData = gulp.src(`${paths.project.src.sprites.png.images}/${folder}/*.{png,jpg}`)
        .pipe(buffer())
        .pipe(spritesmith({
            imgName: `sprites-${folder}.png`,
            cssName: `sprites-${folder}.scss`,
            cssFormat: 'scss',
            algorithm: 'binary-tree',
            padding: 10,
            algorithmOpts: {sort: false},
            engine: Boolean(argv.canvassmith) ? 'canvassmith' : 'pixelsmith',
            cssTemplate: paths.project.src.sprites.png.template,
            cssVarMap: function (sprite) {
                sprite.name = `${folder}-${sprite.name}`;
            }
        }));
    const imgStream = spriteData.img
        .pipe(buffer())
        .pipe(_if(argv.production, tinypng()))
        .pipe(gulp.dest(paths.project.build.sprites.png));
    const cssStream = spriteData.css
        .pipe(gulp.dest(paths.project.src.sprites.scss));

    return merge(imgStream, cssStream);
}));

gulp.task('sprites-svg', () =>
    gulp.src(paths.project.watch.sprites.svg)
        .pipe(_if(argv.production, svgmin()))
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

gulp.task('sprites', gulp.series('sprites-png', 'sprites-svg'));

//------------------------------------------------------------ Watch

gulp.task('watch', () => {
    gulp.watch(paths.project.watch.html)
        .on('add', gulp.parallel('html'))
        .on('change', gulp.parallel('html'))
        .on('unlink', gulp.parallel('html'));

    gulp.watch(paths.project.watch.js)
        .on('add', gulp.parallel('js'))
        .on('change', gulp.parallel('js'))
        .on('unlink', gulp.parallel('js'));

    gulp.watch(paths.project.watch.styles)
        .on('add', gulp.parallel('styles'))
        .on('change', gulp.parallel('styles'))
        .on('unlink', gulp.parallel('styles'));

    gulp.watch(paths.project.watch.fonts)
        .on('add', gulp.parallel('fonts'))
        .on('change', gulp.parallel('fonts'))
        .on('unlink', gulp.parallel('fonts'));

    gulp.watch(paths.project.watch.images)
        .on('add', gulp.parallel('images'))
        .on('change', gulp.parallel('images'))
        .on('unlink', gulp.parallel('images'));
});

//------------------------------------------------------------ Other

function handleErrors(e) {
    notifier.notify({
        // icon: './logo.png',
        title: project.name + ': ' + e.name,
        message: e.message,
        sound: true,
        open: e.file
    });
    this.end();
}

gulp.task('browserSync', () => browserSync(syncOptions));

gulp.task('clean', () => del(paths.clean));

gulp.task('build', gulp.series('clean', 'html', 'fonts', 'styles', 'js', 'images', 'sprites'));

gulp.task('default', gulp.parallel('browserSync', 'watch'));
import { API_URL } from './api/common/const.js';
import autoprefixer from 'autoprefixer';
import bemValidator from 'gulp-html-bem-validator';
import cssnano from 'cssnano';
import customMedia from 'postcss-custom-media';
import del from 'del';
import eslint from 'gulp-eslint';
import fetch from 'node-fetch';
import { getPageData } from './api/common/util.js';
import gulp from 'gulp';
import gulpData from 'gulp-data';
import gulpIf from 'gulp-if';
import imagemin from 'gulp-imagemin';
import lintspaces from 'gulp-lintspaces';
import mozjpeg from 'imagemin-mozjpeg';
import mqpacker from 'postcss-sort-media-queries';
import nodemon from 'gulp-nodemon';
import pngquant from 'imagemin-pngquant';
import postcss from 'gulp-postcss';
import postcssBemLinter from 'postcss-bem-linter';
import postcssImport from 'postcss-easy-import';
import postcssNested from 'postcss-nested';
import postcssReporter from 'postcss-reporter';
import posthtml from 'gulp-posthtml';
import rename from 'gulp-rename';
import server from 'browser-sync';
import stackSprite from 'gulp-svg-sprite';
import stylelint from 'stylelint';
import svgo from 'imagemin-svgo';
import svgoConfig from './svgo.config.js';
import twig from 'gulp-twig';
import vinylNamed from 'vinyl-named';
import webp from 'gulp-webp';
import webpack from 'webpack';
import webpackConfig from './webpack.config.js';
import webpackStream from 'webpack-stream';

const IS_DEV = process.env.NODE_ENV === 'development';
let store = {};

const Entry = {
	ICONS: 'source/icons/**/*.svg',
	IMAGES: ['source/images/**/*.{jpg,png,svg}'],
	LAYOUTS: 'source/layouts/pages/**/*.twig',
	MEDIAQUERIES: 'source/styles/common/mq.css',
	SCRIPTS: ['source/scripts/*.js'],
	STATIC: ['source/static/**/*', '!source/static/**/*.md'],
	STYLES: 'source/styles/*.css'
};
const Watch = {
	API: 'api/restart.log',
	ENGINE: ['api/**/*.js', '*.{js,cjs}'],
	LAYOUTS: 'source/**/*.twig',
	SCRIPTS: 'source/scripts/**/*.js',
	STYLES: 'source/styles/**/*.css'
};
const Destination = {
	IMAGES: 'build/images',
	ROOT: 'build',
	SCRIPTS: 'build/scripts',
	STYLES: 'build/styles'
};
if (!IS_DEV) {
	Entry.IMAGES.push('!source/images/pixelperfect/**/*.{jpg,png,svg}');
	Entry.SCRIPTS.push('!source/scripts/dev.js');
}

const { src, dest, watch, series, parallel } = gulp;
const checkLintspaces = () => lintspaces({ editorconfig: '.editorconfig' });
const optimizeImages = () => imagemin([
	svgo(svgoConfig),
	mozjpeg({ progressive: true, quality: 75 }),
	pngquant()
]);

export const buildLayouts = () => src(Entry.LAYOUTS)
	.pipe(gulpData(async (file) => {
		const page = file.path.replace(/^.*pages(\\+|\/+)(.*)\.twig$/, '$2')
			.replace(/\\/g, '/');

		const data = await (IS_DEV ? fetch(`${API_URL}/${page}`).then((res) => res.json()) : getPageData(page));

		store = { ...data, IS_DEV };
		return store;
	}))
	.pipe(twig({
		filters: [
			{
				func(str, args) {
					const [sign = '.'] = args || [];

					if ((/(\.|\?|!|,|:|???)$/).test(str)) {
						return str;
					}
					return `${str}${sign}`;
				},
				name: 'punctify'
			}
		],
		functions: [
			{
				func(key) {
					return store.Term[key];
				},
				name: 'Term'
			}
		]
	}))
	.pipe(posthtml())
	.pipe(bemValidator())
	.pipe(gulpIf(process.env.NODE_ENV !== 'test', dest(Destination.ROOT)));

export const buildStyles = () => src(Entry.STYLES)
	.pipe(postcss((() => {
		const plugins = [
			postcssImport(),
			customMedia({ importFrom: Entry.MEDIAQUERIES }),
			postcssNested(),
			mqpacker(),
			autoprefixer()
		];

		if (!IS_DEV) {
			plugins.push(cssnano({ preset: ['default', { cssDeclarationSorter: false }] }));
		}

		return plugins;
	})()))
	.pipe(rename({ suffix: '.min' }))
	.pipe(dest(Destination.STYLES));

export const buildScripts = () => src(Entry.SCRIPTS)
	.pipe(vinylNamed())
	.pipe(webpackStream(webpackConfig, webpack))
	.pipe(dest(Destination.SCRIPTS));

export const buildSprite = () => src(Entry.ICONS)
	.pipe(gulpIf(!IS_DEV, optimizeImages()))
	.pipe(stackSprite({ mode: { stack: true } }))
	.pipe(rename('sprite.min.svg'))
	.pipe(dest(Destination.IMAGES));

export const copyImages = () => src(Entry.IMAGES)
	.pipe(gulpIf(!IS_DEV, optimizeImages()))
	.pipe(dest(Destination.IMAGES))
	.pipe(webp({ quality: 80 }))
	.pipe(dest(Destination.IMAGES));

export const copyStatic = () => src(Entry.STATIC)
	.pipe(dest(Destination.ROOT));

export const lintLayouts = () => src([Watch.LAYOUTS, Entry.ICONS])
	.pipe(checkLintspaces())
	.pipe(lintspaces.reporter());

export const lintStyles = () => src(Watch.STYLES)
	.pipe(checkLintspaces())
	.pipe(lintspaces.reporter())
	.pipe(postcss([
		stylelint(),
		postcssBemLinter(),
		postcssReporter({ clearAllMessages: true, throwError: !IS_DEV })
	]));

export const lintScripts = () => src([...Watch.ENGINE, Watch.SCRIPTS])
	.pipe(checkLintspaces())
	.pipe(lintspaces.reporter())
	.pipe(eslint({ fix: false }))
	.pipe(eslint.format())
	.pipe(gulpIf(!IS_DEV, eslint.failAfterError()));

export const cleanDestination = () => del(Destination.ROOT);

export const reload = (done) => {
	server.reload();
	done();
};

export const startServer = (done) => {
	server.init({
		cors: true,
		open: false,
		server: Destination.ROOT,
		ui: false
	});

	watch(Entry.ICONS, series(buildSprite, reload));
	watch(Entry.IMAGES, series(copyImages, reload));
	watch(Entry.STATIC, series(copyStatic, reload));
	watch(Watch.API, series(buildLayouts, reload));
	watch(Watch.ENGINE, lintScripts);
	watch(Watch.LAYOUTS, series(lintLayouts, buildLayouts, reload));
	watch(Watch.SCRIPTS, series(lintScripts, buildScripts, reload));
	watch(Watch.STYLES, series(lintStyles, buildStyles, reload));

	done();
};

export const startApi = (done) => nodemon({
	ext: 'js json',
	script: './api',
	watch: ['api']
}).on('start', done);

export const lintSource = parallel(lintLayouts, lintStyles, lintScripts);
export const lint = series(lintSource, buildLayouts);
export const compile = parallel(buildLayouts, buildStyles, buildScripts, buildSprite, copyImages, copyStatic);
export const build = series(parallel(lintSource, cleanDestination), compile);
export const dev = series(startApi, build, startServer);
export default dev;

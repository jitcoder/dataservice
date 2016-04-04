'use strict';

const babelify = require('babelify');
const browserify = require('browserify');
const browserifyInc = require('browserify-incremental');
const gulp = require('gulp');
const gulpsync = require('gulp-sync')(gulp);
const gulpif = require('gulp-if');
const gutil = require('gulp-util');
const sassify = require('sassify');
const streamify = require('gulp-streamify');
const uglify = require('gulp-uglify');
const source = require('vinyl-source-stream');
const path = require('path');
const del = require('del');
const watchify = require('watchify');
const browserSync = require('browser-sync').create();
const glob = require('glob');
const merge = require('merge-stream');
const watch = require('gulp-watch');
const childProcess = require('child_process');
const spawn = childProcess.spawn;
const os = require('os');
const envify = require('envify');

let appFiles = glob('./src/apps/*.*', {
    sync: true
});

let LIVE = false;
let DEBUG = true;
process.env.NODE_ENV = 'development';

const modulePaths = [
    './node_modules',
    './src/components',
    './src/modules',
    './src/sass'
];

const libs = ['react','react-dom'];

function compile(appPath) {
    let moduleExt = path.extname(appPath);
    let moduleName = path.basename(appPath, moduleExt);
    let outputName = moduleName + '.js';
    let props = {
        debug: DEBUG,
        extensions: ['.js', '.jsx', 'scss'],
        external:['react','react-dom'],
        entries: appPath,
        paths: modulePaths,
        cache: {},
        packageCache: {},
        fullPaths: DEBUG,
        baseDir: __dirname
    };

    let bundle = LIVE ? watchify(browserify(props)) : browserify(props);

    function writeBundle() {
        return bundle.bundle()
            .on('error', (e) => gutil.log(e.message))
            .pipe(source(outputName))
            .pipe(gulpif(!DEBUG, streamify(uglify())))
            .pipe(gulp.dest('./dist/assets/js'));
    }

    bundle
        .on('file', (file) => gutil.log('\t', gutil.colors.yellow('Building'), gutil.colors.bold(path.relative(__dirname, file))))
        .transform(sassify, {
            'auto-inject': true,
            base64Encode: false,
            sourceMap: DEBUG
        })
        .transform(babelify, {
            presets: ['babel-preset-es2015', 'babel-preset-react','babel-preset-stage-3']
        });

    if (DEBUG) {
        browserifyInc(bundle, {
            cacheFile: path.join(os.tmpdir(), outputName + '.cache')
        });
    }

    if (LIVE) {
        bundle.on('update', (file) => {
            gutil.log('Updating ' + file);
            writeBundle();
        });
    }

    return writeBundle();
}

gulp.task('vendor',function(){
    var b = browserify({
        debug: DEBUG,
        extensions: ['.js'],
        entries: require.resolve('babel-polyfill'),
        paths: modulePaths,
        baseDir: __dirname
    })
    .transform(sassify, {
        'auto-inject': true,
        base64Encode: false,
        sourceMap: DEBUG
    })
    .transform(envify)
    .transform(babelify, {
        presets: ['babel-preset-es2015']
    });
    
    for(let i = 0; i < libs.length; i++){
        b.require(libs[i]);
    }
    
    browserifyInc(path.join(os.tmpdir(),'vendor.js.cache'));
    
    b.bundle()
    .pipe(source('vendor.js'))
    .pipe(gulpif(!DEBUG, streamify(uglify())))
    .pipe(gulp.dest('./dist/assets/js'));
    
    return b;
});

gulp.task('rebuild', gulpsync.sync(['clean', 'build']), function() {});

gulp.task('build', gulpsync.sync(['mode:print', 'static', 'vendor', 'apps']), function() {});

gulp.task('default', ['build'], function() {});

gulp.task('production', function() {
    DEBUG = false;
    process.env.NODE_ENV = 'production';
});

gulp.task('mode:print', function() {
    var mode;

    if (DEBUG) {
        mode = gutil.colors.yellow('DEVELOPMENT');
    } else {
        mode = gutil.colors.red('PRODUCTION');
    }

    gutil.log('');
    gutil.log('-->', mode, gutil.colors.bold(' MODE'), '<--');
    gutil.log('');
});

gulp.task('mode:live', function() {
    LIVE = true;
    DEBUG = true;
    process.env.NODE_ENV = 'development';
});

//Main tasks
gulp.task('live', gulpsync.sync(['mode:live', 'rebuild']), function() {
    gutil.log(gutil.colors.bold('launching server process...'));
    spawn('node', ['app.js'], {
        stdio: 'inherit'
    });

    browserSync.init({
        open: false,
        proxy: 'localhost:8181',
        port: 7171,
        files: './dist/**/*'
    });


});

gulp.task('apps', function() {
    var bundles = [];
    for (var i = 0; i < appFiles.length; i++) {
        bundles.push(compile(appFiles[i]));
    }
    return merge(bundles);
});

gulp.task('clean', function() {
    return del([
        path.join(os.tmpdir(), '*.cache'),
        './dist/**/*'
    ], {
        force: true
    });
});

gulp.task('static', function() {
    return merge([
        gulp.src(['./src/assets/**/*']).pipe(gulp.dest('./dist/assets/')),
        gulp.src(['./src/views/**/*']).pipe(gulp.dest('./views/'))
    ]);
});

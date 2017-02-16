/**
*
* Copyright 2016 Google Inc. All rights reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/* eslint-env node */
const path = require('path');
const gulp = require('gulp');
const gutil = require('gulp-util');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const handlebars = require('gulp-handlebars');
const rename = require('gulp-rename');
const gzip = require('gulp-gzip');
const uglify = require('gulp-uglify');
const defineModule = require('gulp-define-module');
const sass = require('gulp-sass');
const rev = require('gulp-rev');
const revReplace = require('gulp-rev-replace');
const respawn = require('respawn');
const del = require('del');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const rollup = require('rollup-stream');
const rollupBabel = require('rollup-plugin-babel');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const onExit = require('signal-exit')

const createIndexedDictionary = require('./create-indexed-dictionary');

const production = process.env.NODE_ENV == 'production';

const paths = {
  serverScripts: {
    src: 'server/**/*.js',
    dest: 'build/'
  },
  testScripts: {
    src: 'test/**/*.js',
    dest: 'build/test'
  },
  serverTemplates: {
    src: 'server/templates/**/*.hbs',
    dest: 'build/templates'
  },
  sharedScripts: {
    src: 'shared/**/*.js',
    dest: 'build/shared'
  },
  dictionary: {
    src: 'shared/dictionary/**/*.txt',
    dest: 'build/game/models'
  },
  scss: {
    src: 'client/css/**/*.scss',
    dest: 'build/static/css'
  },
  copy: {
    src: 'client/**/*.{svg,png,jpg,wav,mp3,mp4,json}',
    dest: 'build/static'
  },
  postProcess: {
    src: 'build/static/**/*',
    dest: 'build/static'
  },
  postProcessServer: {
    src: 'build/**/*.js',
    dest: 'build/'
  }
};

const serverProcess = respawn(['node', `${paths.serverScripts.dest}/index.js`]);
const databaseProcess = respawn(['docker', 'start', '-a', 'bwq-mongo']);

// hook up the logging
for (const process of [serverProcess, databaseProcess]) {
  process.on('stdout', data => gutil.log(data.toString('utf-8')));
  process.on('stderr', data => gutil.log(data.toString('utf-8')));
  process.on('warn', data => gutil.log(data.toString('utf-8')));
}

process.stdin.resume();

// shut down gracefully
onExit(() => {
  serverProcess.child && serverProcess.child.kill();
  databaseProcess.child && databaseProcess.child.kill();
});

// TASKS:

function waitTask(ms) {
  return () => new Promise(r => setTimeout(r, ms));
}

function clean() {
  return del(['build']);
}

function serverScripts() {
  return gulp.src(paths.serverScripts.src, {
    since: gulp.lastRun(serverScripts)
  }).pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2017'],
      plugins: ["transform-es2015-modules-commonjs", ["transform-react-jsx", { "pragma":"h" }]]
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.serverScripts.dest));
}

function testScripts() {
  return gulp.src(paths.testScripts.src, {
    since: gulp.lastRun(testScripts)
  }).pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2017'],
      plugins: ["transform-es2015-modules-commonjs", ["transform-react-jsx", { "pragma":"h" }]]
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.testScripts.dest));
}

function sharedScripts() {
  return gulp.src(paths.sharedScripts.src, {
    since: gulp.lastRun(sharedScripts)
  }).pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2017'],
      plugins: ["transform-es2015-modules-commonjs", ["transform-react-jsx", { "pragma":"h" }]]
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.sharedScripts.dest));
}

function dictionary() {
  return gulp.src(paths.dictionary.src, {
    since: gulp.lastRun(dictionary),
    buffer: false
  }).pipe(createIndexedDictionary())
    .pipe(gulp.dest(paths.dictionary.dest));
}

function serverTemplates() {
  return gulp.src(paths.serverTemplates.src, {
    since: gulp.lastRun(serverTemplates)
  }).pipe(handlebars())
    .pipe(defineModule('node'))
    .pipe(gulp.dest(paths.serverTemplates.dest)); 
}

function server() {
  serverProcess.start();
}

function databaseServer() {
  databaseProcess.start();
}

function serverRestart(cb) {
  serverProcess.stop(() => {
    serverProcess.start();
    cb();
  });
}

function scss() {
  return gulp.src(paths.scss.src)
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.scss.dest));
}

function copy() {
  return gulp.src(paths.copy.src, {
    since: gulp.lastRun(copy)
  }).pipe(gulp.dest(paths.copy.dest));
}

function createScriptTask(src, dest) {
  const parsedPath = path.parse(src);
  const isServiceWorker = false;
  //const isServiceWorker = src.endsWith('-sw/index.js');

  const presets = isServiceWorker ?
    ['es2017']
    :
    ['es2017', ['es2015', {modules: false}]];

  let cache;
  return function script() {
    return rollup({
      entry: src,
      sourceMap: true,
      cache,
      format: 'iife',
      context: 'window',
      plugins: [
        nodeResolve({
          preferBuiltins: false,
          browser: true,
          jsnext: true,
          main: true
        }),
        commonjs({
          ignoreGlobal: true
        }),
        rollupBabel({
          presets: presets,
          plugins: [["transform-react-jsx", {pragma:"h"}], "external-helpers", "transform-object-rest-spread"]
        })
      ]
    }).on('bundle', function(bundle) {
      cache = bundle;
    }).on('error', function(err) {
      gutil.log(err);
      this.emit('end');
    }).pipe(source('index.js', parsedPath.dir))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(rename({basename: /\/([^\/]+)$/.exec(parsedPath.dir)[1]}))
      .pipe(production ? uglify() : gutil.noop())
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(dest));
  };
}

const browserScripts = [
  {src: './client/js/homescreen/index.js', dest: './build/static/js'},
  {src: './client/js/game/index.js', dest: './build/static/js'},
  {src: './client/js/polyfills/index.js', dest: './build/static/js'}
];

for (const item of browserScripts) {
  item.task = createScriptTask(item.src, item.dest);
}

function replaceIfMap(filename) {
  if (filename.indexOf('.map') > -1) {
    return filename.replace(/^[^/]+\//, '');
  }
  return filename;
}

function revStatic() {
  return gulp.src(paths.postProcess.src)
    .pipe(rev())
    .pipe(revReplace({
      modifyUnreved: replaceIfMap,
      modifyReved: replaceIfMap
    }))
    .pipe(gulp.dest(paths.postProcess.dest))
    .pipe(rev.manifest())
    .pipe(gulp.dest(paths.postProcess.dest));
}

function updateServerScriptsForRev() {
  const manifest = gulp.src('build/static/rev-manifest.json');

  return gulp.src(paths.postProcessServer.src)
    .pipe(revReplace({
      manifest,
      modifyUnreved: replaceIfMap,
      modifyReved: replaceIfMap
    }))
    .pipe(gulp.dest(paths.postProcessServer.dest));
}

function gzipStatic() {
  return gulp.src(paths.postProcess.src)
    .pipe(gzip({skipGrowingFiles: true}))
    .pipe(gulp.dest(paths.postProcess.dest));
}

function watch() {
  const browserScriptTasks = browserScripts.map(i => i.task);

  // server
  gulp.watch(paths.serverScripts.src, gulp.series(serverScripts, serverRestart));
  gulp.watch(paths.testScripts.src, testScripts);
  gulp.watch(paths.dictionary.src, dictionary);
  gulp.watch(paths.serverTemplates.src, gulp.series(serverTemplates, serverRestart));
  gulp.watch(paths.sharedScripts.src, gulp.series(sharedScripts, gulp.parallel(...browserScriptTasks), serverRestart));

  // client
  gulp.watch(paths.scss.src, scss);
  gulp.watch(paths.copy.src, copy);
  gulp.watch('client/js/**/*.js', gulp.parallel(...browserScriptTasks));
}

gulp.task('serverTemplates', serverTemplates);
gulp.task('browserScripts', gulp.parallel(...browserScripts.map(i => i.task)));

const mainBuild = gulp.series(
  clean,
  gulp.parallel(serverScripts, testScripts, serverTemplates, sharedScripts, dictionary, copy, scss, 'browserScripts')
);

gulp.task('build', gulp.series(
  mainBuild,
  revStatic,
  gulp.parallel(gzipStatic, updateServerScriptsForRev)
));

gulp.task('serve', gulp.series(
  mainBuild,
  gulp.parallel(
    databaseServer,
    // Wait for database to start up
    // TODO: I should find a better way to do this
    gulp.series(waitTask(1500), server),
    watch
  )
));

import gulp from 'gulp';
import babel from 'gulp-babel';
import browserify from 'browserify';
import commonjs from "gulp-commonjs-module";
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import standalonify from 'standalonify';
import watchify from 'watchify';
import babelify from 'babelify';
import uglify from 'gulp-uglify';
import jasmine from 'gulp-jasmine';
import template from 'gulp-template';
import rename from 'gulp-rename';
import concat from 'gulp-concat';
import sequence from 'gulp-sequence';
import gulpif from 'gulp-if';
import less from 'gulp-less';
import cssnano from 'gulp-cssnano';
import eslint from 'gulp-eslint';
import notify from 'gulp-notify';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import { argv } from 'yargs';
import glob from 'glob';
import { create } from 'browser-sync';
import tsify from 'tsify';//Browserify的一个插件访问typescript编译器
import babelpolyfill from "babel-plugin-transform-runtime"; //babel有关的，当时用到ES7或ES6 generator
import del from 'del';
import precompiler from 'nornj/precompiler';
import pkg from './src/package';

const reload = create().reload;

var fs = require('fs'); // 引入fs模块

let libNameSpace = 'oct';
let distPath = './dist';

let isBundling = false,
  isPrecompileTmpl = true,
  isBrowserSync = false;

function bundle(pluginName) {
  isBundling = true;
  let jsLibName = `${pluginName}.js`;

  let b = browserify({
    entries: `./src/gulp/gulp${pluginName}.ts`
  })
    .plugin(standalonify, {  //Build UMD standalone bundle and support dependencies.
      name: [libNameSpace, 'octProtect'],
      deps: {}
    })
    .plugin(tsify)
    .transform(babelify, {  //Transform es6 to es5.
      plugins: ['external-helpers', 'transform-runtime']
    });

  b.on('error', function (e) {
    console.log(e);
  });

  return b.bundle()
    .on('error', function () {
      let args = Array.prototype.slice.call(arguments);

      //Send error to notification center with gulp-notify
      notify.onError({
        title: "Compile Error",
        message: "<%= error.message %>"
      }).apply(this, args);

      //Keep gulp from hanging on this task
      this.emit('end');
    })

    .pipe(source(jsLibName))
    .pipe(buffer())
    .pipe(gulp.dest(distPath).on('end', function () {
      gulp.src([distPath + jsLibName])
        .pipe(concat(jsLibName))
        .pipe(uglify())
        .pipe(gulp.dest(distPath).on('end', function () {
          isBundling = false;
        }))

        .pipe(gulpif(isBrowserSync, reload({ stream: true })));
    }));
}

function setVersion() {
  // 写入文件内容（如果文件不存在会创建一个文件）
  // 传递了追加参数 { 'flag': 'a' }
  let path = `./dist/version.json`;
  let str = `{"oae":"${getVersion()}","oss":"${getVersion("Smart")}"}`;

  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
  str = str.replace(/\^/g, "");
  // console.log(str);
  fs.writeFileSync(path, str);

}

function getVersion(str) {
  let res = pkg.dependencies["oae-zh"];
  if (str == "Smart" || str == "SmartHtmlHelper") {
    res = pkg.dependencies["oss-zh"];
  }
  return res

}

function test() {
  // 写入文件内容（如果文件不存在会创建一个文件）
  // 传递了追加参数 { 'flag': 'a' }
  let path = `./dist/version.json`;
  let str = `{"oae":"${getVersion()}","oss":"${getVersion("Smart")}"}`;

  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
  str = str.replace(/1/g, "");
  // console.log(str);
  fs.writeFileSync(path, str.replace("^", ""));

}

gulp.task('del', function (cb) {
  del([
    //'dist/report.csv',
    // 这里我们使用一个通配模式来匹配 `mobile` 文件夹中的所有东西
    'dist/*',

  ], cb);
});

// gulp.task('build-smart', function () { bundle("Smart") });
// gulp.task('build-smartHtmlHelper', function () { bundle("SmartHtmlHelper") });
// //打包 smart
// gulp.task('smart', ["build-smart", "build-smartHtmlHelper"]);


// // gulp.task('build-workflowengine', function () { bundle("workflowengine") });
// // gulp.task('build-workflowtranslator', function () { bundle("workflowtranslator") });
// //打包engine
// gulp.task('workflow', ["build-workflowengine", "build-workflowtranslator"]);

// //Default task
// gulp.task('ver', setVersion)

// //Default task
// gulp.task('default', ['del', 'smart', 'workflow']);

// gulp.task('test', test);


gulp.task('default', function () { bundle("test") });




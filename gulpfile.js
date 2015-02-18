var gulp = require('gulp');
var path = require('path');
var _ = require('lodash');
var me = __dirname;
var pkg = require('./package.json');

var options = {
  // client side project
  self: './',
  project: 'public/',
  // server side project
  build: 'build/',
  src: 'src/',
  test: 'test/',
  // for a client side project that needs minification
  dist: 'dist/'
};
_(options).forOwn(function (v, k) {
  options[k] = path.resolve(me, v);
});
options.libs = [
  { require: 'q', expose: 'q' },
  { require: 'lodash', expose: 'lodash' },
  { require: 'dagre', expose: 'dagre' }
];

// tasks:
// - bundle:vendor
// - bundle:app
var bundler = require('./gulp/bundle');
bundler(options);
// tasks:
// - compass
// - watch:compass
require('./gulp/compass')(options);
// tasks:
// - server
require('./gulp/server')(options);
// tasks:
// - test
// - watch:test
require('./gulp/test')(options);
// tasks:
// - jshint
require('./gulp/linter')(options);
// tasks:
// - polymer:rename
// - polymer:build
// - polymer
require('./gulp/polymer')(options);
// tasks:
// - release:major
// - release:minor
// - release:patch
require('./gulp/release')();

// main tasks
gulp.task('watch', ['watch:test', 'watch:compass']);
gulp.task('default', ['bundle', 'bundle:renderer', 'watch'], function () {
  gulp.start('server');
});

// **** Custom build for pojoviz renderers ****
gulp.task('bundle:renderer', function () {
  bundler.bundlerGenerator({
    src: './src/renderer/index.js',
    name: pkg.name + '-renderers',
    onPreBundle: function (bundler) {
      options.libs.forEach(function(lib) {
        bundler.external(lib.require, {expose: lib.expose});
      });
    }
  });
});

gulp.task('build-page', ['polymer', 'compass']);

gulp.task('build-app', [
  'bundle',
  'bundle:renderer'
]);

// show be run with NODE_ENV=production
gulp.task('build', ['build-app', 'build-page']);
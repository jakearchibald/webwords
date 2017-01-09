const through = require("through2");
const split = require("split");
const gutil = require('gulp-util');
const PluginError = gutil.PluginError;
const PLUGIN_NAME = 'create-indexed-dictionary';

function indexWordList() {
  const wordLookup = {};

  return through(
    function (chunk, enc, cb) {
      const str = chunk.toString();
      const levels = 3;

      if (str.length < 2) {
        cb();
        return;
      }

      let index = wordLookup;
      let i = 0;

      for (; i < (levels - 1); i++) {
        index = index[str[i] || ''] ||
          (index[str[i] || ''] = {});
      }

      const words = index[str[i] || ''] ||
        (index[str[i] || ''] = []);

      words.push(str);
      cb();
    },
    function (cb) { // flush function
      this.push('module.exports = ' + JSON.stringify(wordLookup));
      cb();
    }
  );
}

function createIndexedDictionary() {
  // creating a stream through which each file will pass
  return through.obj(function(file, enc, cb) {
    if (file.isBuffer()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Buffers not supported!'));
      return cb();
    }

    if (file.isStream()) {
      // define the streamer that will transform the content
      var streamer = indexWordList();
      // catch errors from the streamer and emit a gulp plugin error
      streamer.on('error', this.emit.bind(this, 'error'));
      // start the transformation
      file.contents = file.contents.pipe(split()).pipe(streamer);
      file.path = file.path.replace('.txt', '.js');
    }

    // make sure the file goes through the next gulp plugin
    this.push(file);
    // tell the stream engine that we are done with this file
    cb();
  });
}

module.exports = createIndexedDictionary;
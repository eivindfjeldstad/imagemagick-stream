var PassThrough = require('stream').PassThrough;
var spawn = require('child_process').spawn;
var Duplexify = require('duplexify');
var util = require('util');
var isError = util.isError;
var inherit = util.inherits;
var fs = require('fs');

/**
 * Expose `ImageMagick`
 */

module.exports = ImageMagick;

/**
 * Constructor
 *
 * @param {String} src
 * @api public
 */

function ImageMagick (src) {
  if (!(this instanceof ImageMagick)) return new ImageMagick(src);

  this.input = '-';
  this.output = '-';
  this._operations = [];
  this._settings = [];

  this.spawn = this.spawn.bind(this);
  this.onerror = this.onerror.bind(this);

  Duplexify.call(this);

  if (src) this.from(src);
  setImmediate(this.spawn);
}

/**
 * Inherit from `Duplexify`
 */

inherit(ImageMagick, Duplexify);

/**
 * Sets the input file format
 *
 * @param {String} args
 * @api public
 */

ImageMagick.prototype.inputFormat = function (args) {
  this.input = args + ':-';
  return this;
},

/**
 * Sets the output file format
 *
 * @param {String} args
 * @api public
 */

ImageMagick.prototype.outputFormat = function (args) {
  this.output = args + ':-';
  return this;
};

/**
 * Sets the `quality` option
 *
 * @param {String|Number} args
 * @api public
 */

ImageMagick.prototype.quality = function (args) {
  this._operations.push('-quality', args);
  return this;
};

/**
 * Sets the `resize` option
 *
 * @param {String} args
 * @api public
 */

ImageMagick.prototype.resize = function (args) {
  this._operations.push('-resize', args);
  return this;
};

/**
 * Sets the `scale` option
 *
 * @param {String} args
 * @api public
 */

ImageMagick.prototype.scale = function (args) {
  this._operations.push('-scale', args);
  return this;
};

/**
 * Sets the `crop` option
 *
 * @param {String} args
 * @api public
 */

ImageMagick.prototype.crop = function (args) {
  this._operations.push('-crop', args);
  return this;
};

/**
 * Sets the `gravity` option
 *
 * @param {String} args
 * @api public
 */

ImageMagick.prototype.gravity = function (args) {
  this._operations.push('-gravity', args);
  return this;
};

/**
 * Sets the `thumbnail` option
 *
 * @param {String} args
 * @api public
 */

ImageMagick.prototype.thumbnail = function (args) {
  this._operations.push('-thumbnail', args);
  return this;
};

/**
 * Sets the `auto-orient` option
 *
 * @api public
 */

ImageMagick.prototype.autoOrient = function () {
  this._operations.push('-auto-orient');
  return this;
};

/**
 * Sets the `type` option
 *
 * @param {String} args
 * @api public
 */

ImageMagick.prototype.type = function (args) {
  this._operations.push('-type', args);
  return this;
};

/**
 * Passes additional settings
 *
 * @param {String|Object} key
 * @param {Mixed} val
 * @api public
 */

ImageMagick.prototype.settings =
ImageMagick.prototype.set = function (key, val) {
  this.freehand('_settings', key, val);
  return this;
}

/**
 * Passes additional operations
 *
 * @param {String|Object} key
 * @param {Mixed} val
 * @api public
 */

ImageMagick.prototype.operations =
ImageMagick.prototype.op = function (key, val) {
  this.freehand('_operations', key, val);
  return this;
};

/**
 * Read image data from path
 *
 * @param {String} path
 * @api public
 */

ImageMagick.prototype.from = function (path) {
  var read = fs.createReadStream(path);
  read.on('error', this.onerror);
  read.pipe(this);
  return this;
};

/**
 * Write image data to path
 *
 * @param {String} path
 * @return {Stream} writable stream
 * @api public
 */

ImageMagick.prototype.to = function (path) {
  var write = fs.createWriteStream(path);
  write.on('error', this.onerror);
  this.pipe(write);
  return write;
};

/**
 * Spawn `convert`
 *
 * @api private
 */

ImageMagick.prototype.spawn = function () {
  var proc = spawn('convert', this.args());

  var stdout = proc.stdout;
  stdout.on('error', this.onerror);
  this.setReadable(stdout);

  var stdin = proc.stdin;
  stdin.on('error', this.onerror);
  this.setWritable(stdin);

  var stderr = proc.stderr;
  stderr.on('data', this.onerror);
  stderr.on('error', this.onerror);

  this.emit('spawn', proc);
};

/**
 * Helper for freehand settings and operations
 *
 * @param {String} key
 * @param {String|Object} obj
 * @param {Mixed} [val]
 * @api private
 */

ImageMagick.prototype.freehand = function (key, op, val) {
  var self = this;

  if (typeof op == 'string') {
    return push(key, op, val);
  }

  Object.keys(op).forEach(function (prop) {
    push(key, prop, op[prop]);
  });

  function push (key, op, val) {
    self[key].push('-' + op);
    if (val != null) self[key].push(val);
  }
};

/**
 * Constructs args for cli call
 *
 * @api private
 */

ImageMagick.prototype.args = function() {
  return this._settings.concat([this.input], this._operations, [this.output]);
}

/**
 * Re-emit errors
 *
 * @param {Error|Buffer} err
 * @api private
 */

ImageMagick.prototype.onerror = function (err) {
  if (!isError(err)) err = new Error(err);
  if (!this.listeners('error')) throw err;
  this.emit('error', err);
};

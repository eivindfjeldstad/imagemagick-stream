var PassThrough = require('stream').PassThrough;
var spawn = require('child_process').spawn
var isError = require('util').isError;
var Duplex = require('reduplexer');
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
  this.args = [];
  
  this.spawn = this.spawn.bind(this);
  this.onerror = this.onerror.bind(this);
  
  this.in = new PassThrough();
  this.out = new PassThrough();
  
  Duplex.call(this, this.in, this.out);
  
  if (src) this.from(src);
  setImmediate(this.spawn);
}
  
ImageMagick.prototype = {
  __proto__: Duplex.prototype,
  
  /**
   * Sets the input file format
   *
   * @param {String} args
   * @api public
   */
  
  inputFormat: function (args) {
    this.input = args + ':-';
    return this;
  },
  
  /**
   * Sets the output file format
   *
   * @param {String} args
   * @api public
   */
  
  outputFormat: function (args) {
    this.output = args + ':-';
    return this;
  },
  
  /**
   * Sets the `quality` option
   *
   * @param {String|Number} args
   * @api public
   */
  
  quality: function (args) {
    this.args.push('-quality', args);
    return this;
  },
  
  /**
   * Sets the `resize` option
   *
   * @param {String} args
   * @api public
   */
   
  resize: function (args) {
    this.args.push('-resize', args);
    return this;
  },
  
  /**
   * Sets the `scale` option
   *
   * @param {String} args
   * @api public
   */
   
  scale: function (args) {
    this.args.push('-scale', args);
    return this;
  },
  
  /**
   * Sets the `crop` option
   *
   * @param {String} args
   * @api public
   */
  
  crop: function (args) {    
    this.args.push('-crop', args);
    return this;
  },
  
  /**
   * Sets the `gravity` option
   *
   * @param {String} args
   * @api public
   */
  
  gravity: function (args) {
    this.args.push('-gravity', args);
    return this;
  },
  
  /**
   * Sets the `thumbnail` option
   *
   * @param {String} args
   * @api public
   */
  
  thumbnail: function (args) {
    this.args.push('-thumbnail', args);
    return this;
  },
  
  /**
   * Sets the `auto-orient` option
   *
   * @api public
   */
  
  autoOrient: function () {
    this.args.push('-auto-orient');
    return this;
  },
  
  /**
   * Sets the `type` option
   *
   * @param {String} args
   * @api public
   */
  
  type: function (args) {
    this.args.push('-type', args);
    return this;
  },

  /**
   * Passes additional arguments
   *
   * @param {Object} options
   * @api public
   */
  
  options: function (options) {    
    Object.keys(options).forEach(function (key) {
      var val = options[key];
      this.args.push('-' + key);
      if (val != null) this.args.push(val);
    }, this);
    
    return this;
  },

  /**
   * Read image data from path
   *
   * @param {String} path
   * @api public
   */
   
  from: function (path) {
    var read = fs.createReadStream(path);
    read.on('error', this.onerror);
    read.pipe(this);
    return this;
  },
  
  /**
   * Write image data to path
   *
   * @param {String} path
   * @api public
   */
   
  to: function (path) {
    var write = fs.createWriteStream(path);
    write.on('error', this.onerror);
    this.pipe(write);
    return this;
  },
  
  /**
   * Spawn `convert`
   *
   * @api private
   */
  
  spawn: function () {
    this.args.push(this.output);
    this.args.unshift(this.input);
    
    var proc = spawn('convert', this.args);
    
    var stdin = proc.stdin;  
    stdin.on('error', this.onerror);
    this.in.pipe(stdin);
    
    var stdout = proc.stdout;
    stdout.on('error', this.onerror);
    stdout.pipe(this.out);
    
    var stderr = proc.stderr;
    stderr.on('data', this.onerror);
    stderr.on('error', this.onerror);
  
    this.emit('spawn', proc);
  },
  
  /**
   * Re-emit errors
   *
   * @param {Error|Buffer} err
   * @api private
   */
  
  onerror: function (err) {
    if (!isError(err)) err = new Error(err);
    if (!this.listeners('error')) throw err;
    this.emit('error', err);
  }
};
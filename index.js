var PassThrough = require('stream').PassThrough;
var Duplex = require('duplexer2').DuplexWrapper;
var spawn = require('child_process').spawn
var isError = require('util').isError;
var fs = require('fs');

function ImageMagick (src) {
  if (!(this instanceof ImageMagick)) return new ImageMagick(src);
  
  this.args = ['-'];
  this.output = '-';
  
  this.in = new PassThrough();
  this.out = new PassThrough();
  
  Duplex.call(this, this.in, this.out);
  
  if (src) this.from(src);
  setImmediate(_spawn.bind(this));
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
    this.args[0] = args + ':-';
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
    var self = this;
    
    Object.keys(options).forEach(function (key) {
      var arg = key.indexOf('-')
        ? ('-' + key)
        : key;
        
      self.args.push(arg);
      var val = options[key];
      if (val != null) self.args.push(val);
    });
    
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
    read.on('error', _onerror.bind(this))
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
    write.on('error', _onerror.bind(this))
    this.pipe(write);
    return this;
  }
};

function _spawn () {
  var onerror = _onerror.bind(this);
  this.args.push(this.output);
  
  var proc = spawn('convert', this.args);
  var stdout = proc.stdout;
  var stdin = proc.stdin;
  
  stdin.on('error', onerror);
  stdout.on('error', onerror);
  
  this.in.pipe(stdin);
  stdout.pipe(this.out);
  
  var stderr = proc.stderr;
  stderr.on('data', onerror);
  stderr.on('error', onerror);
  
  this.emit('spawn', proc);
}

function _onerror (err) {
  if (!isError(err)) err = new Error(err.toString());
  this.emit('error', err);
}

module.exports = ImageMagick;
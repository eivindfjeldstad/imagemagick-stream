var spawn = require('child_process').spawn
  , Duplex = require('stream').Duplex
  , isError = require('util').isError
  , fs = require('fs');


// Node pre v0.10.0 comp.
if (!Duplex) Duplex = require('readable-stream').Duplex;

function ImageMagick (src) {
  if (!(this instanceof ImageMagick))
    return new ImageMagick(src);
  
  Duplex.call(this);
  this.source = undefined;
  this.args = ['-'];
  src && this.from(src);
  process.nextTick(_spawn.bind(this));
}
  
ImageMagick.prototype = {
  __proto__: Duplex.prototype,
  
  /**
   * Implementing _read
   *
   * @api private
   */
  
  _read: function (n) {
    if (!this.source) return this.push('');
    var chunk = this.source.read(n);
    this.push(chunk || '');
  },
  
  /**
   * Implementing _write
   *
   * @api private
   */
  
  _write: function (chunk, encoding, callback) {
    if (this.dest) {
      this.dest.write(chunk, encoding, callback);
      return;
    }
    
    this.once('spawn', function () {
      this._write(chunk, encoding, callback);
    });
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
  this.args.push('-');
  
  var proc = spawn('convert', this.args);
  
  var stdout = proc.stdout;
  stdout.on('end', this.push.bind(this, null));
  stdout.on('readable', this.read.bind(this, 0));
  stdout.on('error', onerror);
    
  var stderr = proc.stderr;
  stderr.on('data', onerror);
  stderr.on('error', onerror);
  
  var stdin = proc.stdin;
  stdin.on('error', onerror);
  this.on('finish', stdin.end.bind(stdin));
  
  this.source = stdout;
  this.dest = stdin;
  this.emit('spawn', proc);
}

function _onerror (err) {
  if (!isError(err)) err = new Error(err.toString());
  this.emit('error', err);
}

module.exports = ImageMagick;

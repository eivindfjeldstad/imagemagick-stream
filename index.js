var spawn = require('child_process').spawn
  , stream = require('stream')
  , Duplex = stream.Duplex
  , Readable = stream.Readable
  , isError = require('util').isError
  , fs = require('fs');


// Node pre v0.10.0 comp.
if (!Duplex) Duplex = require('readable-stream').Duplex;
if (!Readable) Readable = require('readable-stream').Readable;

function ImageMagick (src) {
  if (!(this instanceof ImageMagick))
    return new ImageMagick(src);
  
  Duplex.call(this);
  this.source = undefined;
  this.args = ['-'];
  this.output = '-';
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
    return this.push('');
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
   * Sets the input file format
   *
   * @param {String} args
   * @api public
   */
  
  inputFormat: function (args) {
    this.args[0]=args+':-';
    return this;
  },
  
  /**
   * Sets the output file format
   *
   * @param {String} args
   * @api public
   */
  
  outputFormat: function (args) {
    this.output = args+':-';
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
    var that = this;
    Object.keys(options).forEach(function(key) {
      var argName = key.indexOf('-') === 0
        ? key
        : ('-' + key);
      that.args.push(argName);
      var argValue = options[key];
      if (argValue !== undefined) {
        that.args.push(argValue);
      }
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
  
  if (!stdout.read) {
    stdout = new Readable();
    stdout.wrap(proc.stdout);
  }
  
  stdout.on('end', this.push.bind(this, null));
  stdout.on('data', this.push.bind(this));
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

"use strict";

const spawn = require('child_process').spawn;
const isError = require('util').isError;
const Duplexify = require('duplexify');
const fs = require('fs');

const operators = Symbol();
const settings = Symbol();

class ImageMagick extends Duplexify {

  /**
   * Constructor
   *
   * @param {String} src
   * @api public
   */

  constructor (src) {
    super();
    this.input = '-';
    this.output = '-';
    this[operators] = [];
    this[settings] = [];
    this.spawned = false;
    if (src) this.from(src);
  }

  /**
   * Resume
   */

  resume () {
    if (!this.spawned) this.spawn();
    this.spawned = true;
    super.resume();
  }

  /**
   * Sets the input file format
   *
   * @param {String} args
   * @api public
   */

  inputFormat (args) {
    this.input = `${args}:-`;
    return this;
  }

  /**
   * Sets the output file format
   *
   * @param {String} args
   * @api public
   */

  outputFormat (args) {
    this.output = `${args}:-`;
    return this;
  }

  /**
   * Sets the `quality` option
   *
   * @param {String|Number} args
   * @api public
   */

  quality (args) {
   this[operators].push('-quality', args);
   return this;
  }

   /**
    * Sets the `resize` option
    *
    * @param {String} args
    * @api public
    */

   resize (args) {
     this[operators].push('-resize', args);
     return this;
   }

   /**
    * Sets the `scale` option
    *
    * @param {String} args
    * @api public
    */

   scale (args) {
     this[operators].push('-scale', args);
     return this;
   }

   /**
    * Sets the `crop` option
    *
    * @param {String} args
    * @api public
    */

   crop (args) {
     this[operators].push('-crop', args);
     return this;
   }

   /**
    * Sets the `gravity` option
    *
    * @param {String} args
    * @api public
    */

   gravity (args) {
     this[operators].push('-gravity', args);
     return this;
   }

   /**
    * Sets the `thumbnail` option
    *
    * @param {String} args
    * @api public
    */

   thumbnail (args) {
     this[operators].push('-thumbnail', args);
     return this;
   }

   /**
    * Sets the `auto-orient` option
    *
    * @api public
    */

   autoOrient () {
     this[operators].push('-auto-orient');
     return this;
   }

   /**
    * Sets the `type` option
    *
    * @param {String} args
    * @api public
    */

   type (args) {
     this[operators].push('-type', args);
     return this;
   }

   /**
    * Sets the `annotate` option
    *
    * @param {String} args
    * @api public
    */

   annotate (degrees, text) {
     this[operators].push('-annotate', degrees, text);
     return this;
   }

   /**
    * Passes additional settings
    *
    * @param {String} key
    * @param {Mixed} val
    * @api public
    */

   set (key, val) {
     this[settings].push(`-${key}`);
     if (val == null) return this;
     if (!Array.isArray(val)) val = [val];
     val.forEach(v => this[settings].push(v));
     return this;
   }

   /**
    * Passes additional operators
    *
    * @param {String} key
    * @param {Mixed} val
    * @api public
    */

   op (key, val) {
     this[operators].push(`-${key}`);
     if (val == null) return this;
     if (!Array.isArray(val)) val = [val];
     val.forEach(v => this[operators].push(v));
     return this;
   }

   /**
    * Read image data from path
    *
    * @param {String} path
    * @api public
    */

   from (path) {
     const read = fs.createReadStream(path);
     read.on('error', this.onerror);
     read.pipe(this);
     return this;
   }

   /**
    * Write image data to path
    *
    * @param {String} path
    * @return {Stream} writable stream
    * @api public
    */

   to (path) {
     const write = fs.createWriteStream(path);
     write.on('error', this.onerror);
     this.pipe(write);
     return write;
   }

   /**
    * Spawn `convert`
    *
    * @api private
    */

   spawn () {
     const onerror = this.onerror.bind(this);
     const proc = spawn('convert', this.args());

     const stdout = proc.stdout;
     stdout.on('error', onerror);
     this.setReadable(stdout);

     const stdin = proc.stdin;
     stdin.on('error', onerror);
     this.setWritable(stdin);

     const stderr = proc.stderr;
     stderr.on('data', onerror);
     stderr.on('error', onerror);
   }

   /**
    * Constructs args for cli call
    *
    * @api private
    */

   args () {
     return this[settings].concat([this.input], this[operators], [this.output]);
   }

   /**
    * Re-emit errors
    *
    * @param {Error|Buffer} err
    * @api private
    */

   onerror (err) {
     if (!isError(err)) err = new Error(err);
     if (!this.listeners('error')) throw err;
     this.emit('error', err);
   }
}

/**
 * Expose factory method.
 */

module.exports = (src) => new ImageMagick(src);

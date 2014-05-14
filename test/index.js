var assert = require('assert');
var fs = require('fs');
var im = require('../');

describe('im()', function () {
  it('should have an .args property', function () {
    var img = im();
    assert(Array.isArray(img.args));
    assert(img.args.length == 0);
  });
  
  it('should have an .input property', function () {
    assert(im().input == '-');
  });
  
  it('should have an .output property', function () {
    assert(im().output == '-');
  });
  
  it('should be pipe-able', function (done) {
    var img = im();
    fs.createReadStream(__dirname + '/test.jpg').pipe(img);
    img.pipe(fs.createWriteStream(__dirname + '/test-resized.jpg'));
    img.on('finish', function () {
      assert(fs.existsSync(__dirname + '/test-resized.jpg'));
      fs.unlinkSync(__dirname + '/test-resized.jpg');
      done();
    });
  });
  
  it('should emit errors from stderr', function (done) {
    var img = im();
    img.write('invalid data');
    img.end();
    img.on('error', function (err) {
      assert(/^convert\:/.test(err.message));
      done();
    });
  });
  
  describe('.from()', function () {
    it('should read from the given path', function (done) {
      var img = im().from(__dirname + '/test.jpg');
      img.pipe(fs.createWriteStream(__dirname + '/test-resized.jpg'));
      img.on('finish', function () {
        assert(fs.existsSync(__dirname + '/test-resized.jpg'));
        fs.unlinkSync(__dirname + '/test-resized.jpg');
        done();
      });
    });
  });
  
  describe('.to()', function () {
    it('should write to the given path', function (done) {
      var img = im().to(__dirname + '/test-resized.jpg');
      fs.createReadStream(__dirname + '/test.jpg').pipe(img);
      img.on('finish', function () {
        assert(fs.existsSync(__dirname + '/test-resized.jpg'));
        fs.unlinkSync(__dirname + '/test-resized.jpg');
        done();
      });
    });
  });
  
  describe('.spawn()', function () {
    it('should call .spawn() with setImmediate', function (done) {
      im().on('spawn', function (proc) {
        assert(proc.stdin);
        assert(proc.stdout);
        done();
      });
    });
  
    it('should add input and output format to .args', function (done) {
      var img = im();
      img.on('spawn', function () {
        assert(img.input == img.args[0]);
        assert(img.output == img.args[img.args.length - 1]);
        done();
      });
    });
  });
  
  describe('.quality()', function () {
    it('should set the quality option', function () {
      var img = im().quality(90);
      assert(img.args.length == 2);
      assert(img.args[0] == '-quality');
      assert(img.args[1] == '90');
    });
  });
  
  describe('.resize()', function () {
    it('should set the resize option', function () {
      var img = im().resize('200x200');
      assert(img.args.length == 2);
      assert(img.args[0] == '-resize');
      assert(img.args[1] == '200x200');
    });
  });
  
  describe('.scale()', function () {
    it('should set the scale option', function () {
      var img = im().scale('200x200');
      assert(img.args.length == 2);
      assert(img.args[0] == '-scale');
      assert(img.args[1] == '200x200');
    });
  });
  
  describe('.crop()', function () {
    it('should set the crop option', function () {
      var img = im().crop('200x200');
      assert(img.args.length == 2);
      assert(img.args[0] == '-crop');
      assert(img.args[1] == '200x200');
    });
  });
  
  describe('.gravity()', function () {
    it('should set the gravity option', function () {
      var img = im().gravity('North');
      assert(img.args.length == 2);
      assert(img.args[0] == '-gravity');
      assert(img.args[1] == 'North');
    });
  });
  
  describe('.thumbnail()', function () {
    it('should set the thumbnail option', function () {
      var img = im().thumbnail('200x200');
      assert(img.args.length == 2);
      assert(img.args[0] == '-thumbnail');
      assert(img.args[1] == '200x200');
    });
  });
  
  describe('.autoOrient()', function () {
    it('should set the auto-orient option', function () {
      var img = im().autoOrient();
      assert(img.args.length == 1);
      assert(img.args[0] == '-auto-orient');
    });
  });
  
  describe('.type()', function () {
    it('should set the type option', function () {
      var img = im().type('jpg');
      assert(img.args.length == 2);
      assert(img.args[0] == '-type');
      assert(img.args[1] == 'jpg');
    });
  });
  
  describe('.inputFormat()', function () {
    it('should set the input format', function () {
      var img = im().inputFormat('test');
      assert(img.input == 'test:-');
    });
  });
  
  describe('.outputFormat()', function () {
    it('should set the output format', function () {
      var img = im().outputFormat('test');
      assert(img.output == 'test:-');
    });
  });
  
  describe('.options()', function () {
    it('should allow freehand arguments', function () {
      var img = im().options({
        'gaussian-blur': 0.05,
        'interlace': 'Plane'
      });
      
      assert(img.args[0] == '-gaussian-blur');
      assert(img.args[1] == '0.05');
      assert(img.args[2] == '-interlace');
      assert(img.args[3] == 'Plane');
    });
  });
});
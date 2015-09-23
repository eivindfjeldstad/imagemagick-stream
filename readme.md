# imagemagick-stream

Streaming imagemagick api

[![npm version](http://img.shields.io/npm/v/imagemagick-stream.svg?style=flat)](https://npmjs.org/package/imagemagick-stream)
[![Build Status](http://img.shields.io/travis/eivindfjeldstad/imagemagick-stream.svg?style=flat)](https://travis-ci.org/eivindfjeldstad/imagemagick-stream)

## Use
    $ npm install imagemagick-stream

```js
var im = require('imagemagick-stream');
var read = fs.createReadStream('image.png');
var write = fs.createWriteStream('image-resized.png');

var resize = im().resize('200x200').quality(90);
read.pipe(resize).pipe(write);

// Alternatively
im('image.png')
  .resize('200x200')
  .quality(90)
  .pipe(write);

// Or
im('image.png')
  .resize('200x200')
  .quality(90)
  .to('image-resized.png');
```

For freehand settings and operations, use `.op()` and `.set()`.
See the [imagemagick docs](http://www.imagemagick.org/script/convert.php) for a list of available options.

``` js
im('image.png')
  .set('density', 400)
  .set('channel', 'RGB')
  .resize('200x200')
  .op('gaussian-blur', 0.05)
  .to('image-resized.png');
```

**NOTE:** You shold listen to the `finish` event on the writable stream you're piping to, not the stream from ImageMagick:
```js
var read = fs.createReadStream('image.png');
var write = fs.createWriteStream('image-resized.png');
var resize = im().resize('200x200').quality(90);

write.on('finish', function () {
  // finished writing
});
```

## License

MIT

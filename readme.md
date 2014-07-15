# imagemagick-stream

Streaming imagemagick api

[![npm version](http://img.shields.io/npm/v/imagemagick-stream.svg?style=flat)](https://npmjs.org/package/imagemagick-stream)
[![Build Status](http://img.shields.io/travis/eivindfjeldstad/validate.svg?style=flat)](https://travis-ci.org/eivindfjeldstad/imagemagick-stream)

## Use
    $ npm install imagemagick-stream

```js
var im = require('imagemagick-stream');
var in = fs.createReadStream('image.png');
var out = fs.createWriteStream('image-resized.png');
  
var resize = im().resize('200x200').quality(90);

in.pipe(resize).pipe(out);
  
// Alternatively
im('image.png')
  .resize('200x200')
  .quality(90)
  .pipe(out);
  
// Or
im('image.png')
  .resize('200x200')
  .quality(90)
  .to('image-resized.png');
```
For freehand arguments, use `.options()`
``` js
im('image.png')
  .resize('200x200')
  .quality(90)
  .options({
    'strip': undefined,
    'gaussian-blur': 0.05,
    'interlace': 'Plane'
  });
```

## License 

MIT

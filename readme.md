# imagemagick-stream

Streaming imagemagick api

[![npm version](http://img.shields.io/npm/v/imagemagick-stream.svg?style=flat)](https://npmjs.org/package/imagemagick-stream)
[![Build Status](http://img.shields.io/travis/eivindfjeldstad/imagemagick-stream.svg?style=flat)](https://travis-ci.org/eivindfjeldstad/imagemagick-stream)

## Install
    $ npm install imagemagick-stream

## Usage
```js
const im = require('imagemagick-stream');
const read = fs.createReadStream('image.png');
const write = fs.createWriteStream('image-resized.png');

const resize = im().resize('200x200').quality(90);
read.pipe(resize).pipe(write);
```

For convenience, you can also pass the input filename to the constructor and the output filename to the `.to()` method.

```js
im('image.png')
  .resize('200x200')
  .quality(90)
  .to('image-resized.png');
```

To use settings and operators that are not currently part of the API, please submit a pull request, or use the `.set()` and `.op()` methods.

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
const read = fs.createReadStream('image.png');
const write = fs.createWriteStream('image-resized.png');

im().resize('200x200').quality(90).pipe(write);

write.on('finish', () => {
  // finished writing
});
```

## License

MIT

# imagemagick-stream

Streaming imagemagick api

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
For "freehand" arguments, use `.options(...)`, e.g.:
``` js
im('image.png')
  .resize('200x200')
  .quality(90)
  .options({
    'strip': undefined,
    'gaussian-blur': 0.05,
    'interlace': 'Plane'
  })
  .to('image-resized.png');
```

## Todo
- More options

## License 

MIT

# imagemagick-stream

Streaming imagemagick api

## Use
    $ npm install dateable

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

## Todo
- More options

## License 

MIT

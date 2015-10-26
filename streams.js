var fs = require('fs');
var spawn = require('child_process').spawn;
var RSVP = require('rsvp');

// Sample imagemagick command
// convert samples/background.gif \( samples/foreground.svg -resize 10% -geometry +160+90 \) -composite output/sample.png

function getFile(img, descriptor) {
  return new RSVP.Promise(function(resolve) {
    resolve(fs.createReadStream(__dirname + '/samples/' + img, { fd: descriptor }));
  });
}

function resize(stream) {
  return new RSVP.Promise(function(resolve, reject) {
    var args = ['-', '-resize 100x', '-'];
    var convert = spawn('convert', args);

    stream.pipe(convert.stdin);
    convert.stderr.pipe(process.stderr);

    resolve(convert.stdout);
  });
}

function composite(fore, back) {
  return new RSVP.Promise(function(resolve, reject) {
    var args = ['fd:3', '\( fd:4 -resize 100x \)', '-composite', '-'];
    var convert = spawn('convert', args);

    fore.pipe(convert.stdin);
    back.pipe(convert.stdin);

    convert.stderr.pipe(process.stderr);

    resolve(convert.stdout);
  });
}

RSVP.hash({
  foreStream: getFile('foreground.svg', '3'),
  backStream: getFile('background.gif', '4')
})
.then(function(hash) {
  hash.composite = composite(hash.backStream, hash.foreStream);
  return RSVP.hash(hash)
})
.then(function(hash) {
  // console.log(hash.composite);
  var writeStream = fs.createWriteStream('output/test.png');
  hash.foreStream.pipe(writeStream);
  process.exit();
})
.catch(function(err) {
  console.log(err);
  process.exit();
})
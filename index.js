var fs = require('fs');
var gm = require('gm');
var im = gm.subClass({ imageMagick: true });
var RSVP = require('rsvp');

// function getResizedBuffer(image, x, y) {
//   return new RSVP.Promise(function(resolve, reject) {
//     fs.readFile(image, function(err, buffer) {
//       if(err) {
//         reject(err);
//         return;
//       }

//       gm(buffer, image)
//         .resize(x, y)
//         .stream('PNG', function(err, b) {
//           if(err) {
//             reject(err);
//             return;
//           }

//           console.log('im good');

//           resolve(buffer);
//         });
//     });
//   });
// }

// RSVP.hash({
//   background: getResizedBuffer('samples/background.gif', 200, 200),
//   foreground: getResizedBuffer('samples/foreground.svg', 200, 200)
// })
// .then(function(hash) {
//   var args = [
//     hash.background,
//     ' \( ',
//     hash.foreground,
//     ' -resize 10% -geometry +160+90 \) '
//   ].join('');
  
//   gm()
//     .command('convert')
//     .in(hash.background)
//     .write('ouput/sample.png', function() {
//       console.log(arguments);
//       process.exit();
//     });
//   // console.log(hash);
//   // gm(hash.background, 'back.png')
//   //   .composite(hash.foreground, 'string')
//   //   .write('output/sample.png', function(err) {
//   //     console.log(arguments);
//   //     process.exit();
//   //   });
// });

var foreground = 'samples/foreground.svg';
var background = 'samples/background.gif'; 

function fileBuffer(image) {
  return new RSVP.Promise(function(resolve, reject) {
    fs.readFile(image, function(err, buffer) {
      if(err) {
        reject(err);
        return;
      }

      resolve(buffer);
    });
  });
}

function resizeBuffer(original, percent) {
  return new RSVP.Promise(function(resolve, reject) {
    im(original)
      .resize(percent)
      .toBuffer('PNG', function(err, buffer) {
        if(err) {
          reject(err);
          return;
        }

        resolve(buffer);
      });
  });
}

function composite(fore, back, offsetX, offsetY) {
  return new RSVP.Promise(function(resolve, reject) {
    im()
      .command('convert')
      .in(back)
      .in(fore)
      .in('-geometry', '+'+offsetX+'+'+offsetY)
      .in('-composite')
      .write('output/newimage.png', function(err, buffer) {
        // console.log(arguments);
        if(err) {
          reject(err);
          return;
        }

        resolve(buffer);
      });
  });
}

RSVP.hash({
  fore: fileBuffer(foreground),
  back: fileBuffer(background)
})
.then(function(hash) {
  return RSVP.hash({
    fore: resizeBuffer(hash.fore, '10%'),
    back: hash.back
  });
})
.then(function(hash) {
  console.log(hash);
  return composite(hash.fore, hash.back, 30, 30);
})
.then(function(hash) {
  console.log(hash);
  process.exit();
})
.catch(function(err) {
  console.log(err);
  process.exit();
});









"use strict";

var fs = require('fs')
    , gm = require('gm').subClass({imageMagick: true});

function saveCodeImage() {
    gm('./htmldrag/pic.jpg')
        .crop(77, 32, 426, 206)
        // .resize(240, 240)
        .noProfile()
        .write('./resize2.png', function (err) {
            if (!err) console.log('done');
        });
}

function getCodeImageBase64() {
    gm('./htmldrag/pic.jpg')
        .crop(77, 32, 426, 206)
        .noProfile()
        .toBuffer('PNG', function (err, buffer) {
            var s = buffer.toString('base64');
            console.log(s);
        });
}
saveCodeImage()





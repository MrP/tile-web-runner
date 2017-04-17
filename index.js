'use strict';
console.log('argv', process.argv);
var argv = require('minimist')(process.argv.slice(2), {string: ['tmpDir'], number: ['tileSize']});
var tileWeb = require('tile-web').tileWeb;
var deployToS3 = require('./deployToS3.js').deployToS3;
var throttle = require('lodash.throttle');
var zip = require('zipfolder');
var rmfr = require('rmfr');
var path = require('path');
var logReject = require('log-reject');

function mapAndDeploy(urlIn) {
    var pathOut = '/tmp/tileweb/';
    var options = {
        tileSize: undefined,
        tmpDir: undefined
    };
    return rmfr(pathOut)
    .then(() => tileWeb(urlIn, pathOut, options))
    .then((pathOutPage) => {
        return zip.zipFolder({folderPath: path.join(pathOut, pathOutPage)})
            .then(() => pathOutPage);
    })
    .then((pathOutPage) => {
        return deployToS3(pathOut, pathOutPage, throttle((progressAmount, progressTotal) => {
            console.log('progress', progressAmount, progressTotal);
        }, 500, { leading: true, trailing: false }));
    }).then(() => {
        console.log('done');
    })
    .catch(logReject);
}

var urlIn = argv._[0] || 'http://www.otterprojectsltd.com/index.html';
console.log('urlIn', urlIn);

mapAndDeploy(urlIn);
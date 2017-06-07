'use strict';

var tileWeb = require('tile-web').tileWeb;
var deployToS3 = require('./deployToS3.js').deployToS3;
var zip = require('zipfolder');
var rmfr = require('rmfr');
var path = require('path');
var logReject = require('log-reject');
var fsp = require('fs-extra');

function mapAndDeploy(urlIn) {
    var pathOut = '/tmp/tileweb/';
    var options = {
        tileSize: undefined,
        tmpDir: undefined
    };
    return rmfr(pathOut)
    .then(() => tileWeb(urlIn, pathOut, options))
    .then((pathOutPage) => {
        return zip.zipFolder({
            folderPath: path.join(pathOut, pathOutPage, '..')
        })
        .then(() => {
            return fsp.move(path.join(pathOut, pathOutPage, '..') + '.zip', path.join(pathOut, pathOutPage) + '.zip');
        })
        .then(() => pathOutPage);
    })
    .then((pathOutPage) => {
        return deployToS3(pathOut, pathOutPage);
    }).then(() => {
        console.log('done');
    })
    .catch(logReject);
}

var urlIn = process.argv[2] || 'http://www.example.com/index.html';
console.log('urlIn', urlIn);

mapAndDeploy(urlIn);
/**
 * A class for interfacing with the File Librarian
 */

const fs = require('fs');
const request = require('request');
const URL = require('url').URL;

module.exports = function(config) {
  this.download = (key,path,filePath) => {
    var url =  new URL('/file', config.host);
    
    url.searchParams.set("library",key);
    url.searchParams.set("path",path);
    var opts = {
      url: url.toString(),
      qs: {
        library: key,
        path: path
      },
      auth: {
        user: config.username,
        pass: config.password
      }
    }

    return new Promise((resolve,reject) => {
      request(opts)
        .on('response', () => {
          return resolve(filePath);
        })
        .on('error', (err) => {
          return reject(err);
        })
        .pipe(fs.createWriteStream(filePath))
    });
  }
}
/**
 * A class for interfacing with the File Librarian
 */

const fs = require('fs');
const request = require('request');
const rp = require('request-promise');
const URL = require('url').URL;

module.exports = function(config) {
  // Calls HEAD to see if the file exists.
  this.stat = (key, path) => {
    var url =  new URL('/file', config.host);
    
    url.searchParams.set("library",key);
    url.searchParams.set("path",path);

    var opts = {
      method: "HEAD",
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

    return rp(opts);
  }

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

  this.upload = (key, path, readstream, contentType, filename) => {
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
      },
      method: "PUT",
      formData: {
        upfile: {
          value: readstream,
          options: {contentType, filename}
        }
      }
    }

    return rp(opts);
  }
}
const fs = require('fs')

const readFile = async function(filePath) {
  return new Promise(function(resolve, reject) {
    fs.readFile(filePath, (err, contents) => {
      if(err) {
        reject(err);
      } else {
        resolve(contents);
      }
    })
  });
}

module.exports = {
  readFile
}

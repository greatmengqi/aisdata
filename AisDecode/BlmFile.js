/**
 * New node file
 */
const fs = require("fs");

function writeToFile(path, data) {
    return new Promise(async function (resolve, reject) {
        fs.appendFile(path, data, function (error) {
            if (error) {
                if (error.errno == '-4058') {
                    fs.writeFile(path, data, function (err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    })
                }
            } else {
                resolve();
            }
        });
    })
}

module.exports.writeToFile = writeToFile;

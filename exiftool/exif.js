const exiftool = require('node-exiftool')
const exiftoolBin = require('dist-exiftool')
const ep = new exiftool.ExiftoolProcess(exiftoolBin)
exports.openExif = () => ep.open()
exports.getData = (openedEp, path, cb) => {
    return openedEp
        .then(() => ep.readMetadata(path, ['charset filename=utf8', 'CreateDate']))
        .then(cb, console.error)
}
exports.closeExif = finishedEp => finishedEp.then(ep.close()).catch(console.error)

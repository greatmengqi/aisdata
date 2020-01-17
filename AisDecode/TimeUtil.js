let moment = require("moment");

// 0:utc 1:东八区
function unifiedDate(dateStr, type, format) {

    let date = 0;

    if (type === "X") {
        date = parseInt(dateStr);
    } else if (type === "x") {
        date = parseInt(dateStr) / 1000;
    }
    else {
        let mo = moment.utc(dateStr, format);
        date = mo.unix()
    }

    if (type === 1) {
        date = date - 8 * 3600
    }
    return date
}


module.exports.unifiedDate = unifiedDate;


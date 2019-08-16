let moment = require("moment");

// 0:utc 1:东八区
function unifiedDate(dateStr, type, format) {

    let date = 0

    if (type == "xxxx") {
        date = parseInt(dateStr);
    } else {
        date = moment(dateStr, format).unix()
    }

    if (type == 1) {
        date = date - 8 * 3600
    }
    return date
}

// console.log(unifiedDate("2019-03-08:11:59:33", 0, "YYYY-MM-DD:HH:mm:ss"));

module.exports.unifiedDate = unifiedDate;

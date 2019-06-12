/**
 * 统一时间
 */
//0:utc 时间  1:北京时间
function unifiedDate(dateStr, type) {
    // console.log(dateStr);
    // console.log(dateStr);
    dateStr = dateStr.replace(':', ' ');
    let dateStmp = 0
    if (type == 0) {
        dateStmp = new Date(dateStr * 1).getTime();
    }
    else if (type == 1) {
        dateStmp = new Date(dateStr).getTime();
    }

    let realTime = 0;
    if (type == 1) {
        realTime = dateStmp - 8 * 60 * 60 * 1000;
    } else if (type == 0) {
        realTime = dateStmp;
    }

    let date = Math.round(new Date(realTime).getTime() / 1000);

    return date;
}

/**
 *  格式时间
 */
function formatDateTime(date) {
    let y = date.getFullYear();
    let m = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    let d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    let h = date.getHours();
    h = h < 10 ? ('0' + h) : h;
    let minute = date.getMinutes();
    minute = minute < 10 ? ('0' + minute) : minute;
    let second = date.getSeconds();
    second = second < 10 ? ('0' + second) : second;
    return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
}


module.exports.unifiedDate = unifiedDate;

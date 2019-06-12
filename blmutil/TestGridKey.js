var GridUtil = require('./GridUtil_new.js');

console.log('lon:0, lat:0: ' + GridUtil.getGridKey(0, 0));
console.log('lon:180, lat:90: ' + GridUtil.getGridKey(180, 90));
console.log('lon:0, lat:90: ' + GridUtil.getGridKey(0, 90));
console.log('lon:180, lat:0: ' + GridUtil.getGridKey(180, 0));

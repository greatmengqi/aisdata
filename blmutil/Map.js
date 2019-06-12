/**
 * @author blune68
 * @version  0.1, 07/27/12
 * 
 */
function Map(){
 
    this.keys = new Array(); 
     
    this.data = new Object();
     
    var toString = Object.prototype.toString;
     
    /**
     * 当前Map当前长度
     */
    this.size = function(){
        return this.keys.length;
    };
     
    /**
     * 添加值
     * @param {Object} key
     * @param {Object} value
     */
    this.put = function(key, value){
        if(this.data[key] == null){
            this.data[key] = value;
            this.keys.push(key);
        }else{  
            this.data[key] = value;
        }
       
    };
    /**
     * 根据当前key获取value
     * @param {Object} key
     */
    this.get = function(key){
        return this.data[key];
    };
    /**
     * 根据当前key移除Map对应值
     * @param {Object} key
     */
    this.remove = function(key){
        var index = this.indexOf(key);
        if(index != -1){
            this.keys.splice(index, 1);
        }
        this.data[key] = null;
    };
    /**
     * 清空Map
     */
    this.clear = function(){
        for(var i=0, len = this.size(); i < len; i++){
            var key = this.keys[i];
            this.data[key] = null;
        }
        this.keys.length = 0;
    };
    /**
     * 当前key是否存在
     * @param {Object} key
     */
    this.containsKey = function(key){
        return this.data[key] != null;
    };
    /**
     * 是否为空
     */
    this.isEmpty = function(){
        return this.keys.length == 0;
    };
    /**
     * 类型Java中Map.entrySet
     */
    this.entrySet = function(){
        var size = this.size();
        var datas = new Array(size);
        for (var i = 0, len = size; i < len; i++) {
            var key = this.keys[i];
            var value = this.data[key];
            datas[i] = {
                'key' : key,
                'value':value   
            };
        }
        return datas;
    };
    /**
     * 遍历当前Map
     * var map = new Map();
     * map.put('key', 'value');
     * map.each(function(index, key, value){
     *      console.log("index:" + index + "--key:" + key + "--value:" + value)
     * })
     * @param {Object} fn
     */
    this.each = function(fn){
        if(toString.call(fn) == '[object Function]'){
            for (var i = 0, len = this.size(); i < len; i++) {
                var key = this.keys[i];
                fn(i, key, this.data[key]);
            }
        }
        return null;
    };
    /**
     * 获取Map中 当前key 索引值
     * @param {Object} key
     */
    this.indexOf = function(key){
        var size = this.size();
        if(size > 0){
            for(var i=0, len=size; i < len; i++){
                if(this.keys[i] == key)
                return i;
            }
        }
        return -1;
    };
    /**
     * Override toString
     */
    this.toString = function(){
        var str = "{";
        for (var i = 0, len = this.size(); i < len; i++, str+=",") {
            var key = this.keys[i];
            var value = this.data[key];
            str += key + "=" + value; 
        }
        str = str.substring(0, str.length-1);
        str += "}";
        return str;
    };
    /**
     * 获取Map中的所有value值(Array)
     */
    this.values = function(){
        var size = this.size();
        var values = new Array();
        for(var i = 0; i < size; i++){
            var key = this.keys[i];
            values.push(this.data[key]);
        }
        return values;
    };     
}
module.exports=Map;
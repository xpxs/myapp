var mongoose = require('mongoose');

//申明一个mongoose对象
var PostSchema = new mongoose.Schema({
    name: String,
    time: Object,
    title: String,
    post: String,
})

//每次执行都会调用,时间更新操作
PostSchema.pre('save', function(next) {
    var date = new Date();
    //存储各种时间格式，方便以后扩展
    var time = {
        date: date,
        year : date.getFullYear(),
        month : date.getFullYear() + "-" + (date.getMonth() + 1),
        day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
        minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
        date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) 
    }
    this.time = time;
    next();
})

//查询的静态方法
PostSchema.statics = {
    fetch: function(cb) { //查询所有数据
        //console.log('cb',cb);
        return this
            .find()
            .limit(5)//查询五条
            //.sort('paw') //排序
            .exec(cb) //回调
    },
    findById: function(title, cb) { //根据id查询单条数据
        return this
            .findOne({ title: title })
            .exec(cb)
    }
}

//暴露出去的方法
module.exports = PostSchema
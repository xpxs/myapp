var    mongoose = require('mongoose');

//申明一个mongoons对象
var IndexSchema = new mongoose.Schema({
    a_title: String,
    a_img: String,
    a_con: String
})

//每次执行都会调用,时间更新操作
IndexSchema.pre('save', function(next) {
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
IndexSchema.statics = {
    fetch: function(cb) { //查询所有数据
        return this
            .find()
            .limit(5)//查询五条
            //.sort('paw') //排序
            .exec(cb) //回调
    },
    findById: function(name, cb) { //根据id查询单条数据
        return this
            .findOne({
                name: name
            })
            .exec(cb)
    }
}
var  Index = mongoose.model('article_table', IndexSchema); // 编译生成Movie 模型
module.exports = Index
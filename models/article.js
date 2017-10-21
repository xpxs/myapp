// 新闻板块
var    mongoose = require('mongoose');
//申明一个mongoose对象
var NewsSchema = new mongoose.Schema({
    articleTitle: String,
    articleBorn: String,
    articleTime: String,
    articleRead: Number,
    articleText: String
})

//查询的静态方法
NewsSchema.statics = {
    fetch: function(cb) { //查询所有数据
        return this
            .find()
            //.sort('paw') //排序
            .exec(cb) //回调
    },
    getNewsAll: function(cb) { //查询所有数据条数
        return this
            .find()
            .count()
            .exec(cb) //回调
    },
    getNewsTwenty: function(page, cb) { //查询十条数据
        return this
            .find()
            .limit(20)
            .skip((page - 1)*20)
            // .sort('-articleTime')
            .exec(cb) //回调
    },
    getNewsTitle: function(title, cb) { //根据id查询单条数据
        return this
            .findOne({articleTitle: title })
            .exec(cb)
    },
}
var  News = mongoose.model('itarticle', NewsSchema); // 编译生成Movie 模型
module.exports = News
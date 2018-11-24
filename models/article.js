// 新闻板块
var    mongoose = require('mongoose');
//申明一个mongoose对象
var ArticlesSchema = new mongoose.Schema({
    articleTitle: String,
    articleBorn: String,
    articleTime: String,
    articleRead: Number,
    articleText: String,
    articleType: String,
})
//查询的静态方法
ArticlesSchema.statics = {
    getArticleTen: function(cb) { //查询所有数据
        return this
            .find()
            .limit(10)
            //.sort('paw') //排序
            .exec(cb) //回调
    },
    getArticleAll: function(cb) { //查询所有数据条数
        return this
            .find()
            .count()
            .exec(cb) //回调
    },
    getArticleTwenty: function(page, cb) { //查询十条数据
        return this
            .find()
            .limit(20)
            .skip((page - 1)*20)
            // .sort('-articleTime')
            .exec(cb) //回调
    },
    getArticleTitle: function(title, cb) { //根据id查询单条数据
        return this
            .findOne({articleTitle: title })
            .exec(cb)
    },
}

var  Articles = mongoose.model('itarticle', ArticlesSchema); // 编译生成Movie 模型
module.exports = Articles
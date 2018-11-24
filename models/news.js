// 新闻板块
var    mongoose = require('mongoose');
//申明一个mongoose对象
var NewsSchema = new mongoose.Schema({
    newsTitle: String,
    newsText: String,
    newsRead: String,
    newsComments: String,
    newsTime: String,
    newsBorn: String,
    newsTotal: String,
    newsReadTotal: String,
    newsWebsite: String,
    articleType: String,
})

NewsSchema.statics = {
    getNewsTen: function(cb) { //查询所有数据
        return this
            .find()
            .limit(10)
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
            .findOne({newsTitle: title })
            .exec(cb)
    }
}
var  News = mongoose.model('newsarticle', NewsSchema); // 编译生成Movie 模型
module.exports = News
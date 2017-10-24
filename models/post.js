// 文章板块
var    mongoose = require('mongoose');
//申明一个mongoose对象
var PostSchema = new mongoose.Schema({
    name: String,
    time: Object,
    title: String,
    post: String,
    tags: Array,
    comments: Array,
    pv: {type:Number,default:0}
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
        return this
            .find()
            //.sort('paw') //排序
            .exec(cb) //回调
    },
    getPostTen: function(cb) { //查询所有数据
        return this
            .find()
            .limit(10)
            //.sort('paw') //排序
            .exec(cb) //回调
    },
    getArchive:function(cb){
        return this
            .find({},{
                "name": 1,
                "time": 1,
                "title": 1
            })
            .sort('-time.day')
            .exec(cb) //回调
    },
    getAll: function(cb) { //查询所有数据条数
        return this
            .find()
            .count()
            .exec(cb) //回调
    },
    getTags: function(cb) { //查询所有标签
        return this
            .distinct('tags')
            .exec(cb) //回调
    },
    getTag: function(tag, cb) { //返回含有特定标签的所有文章
        return this
            .find({
                "tags": tag
              }, {
                "name": 1,
                "time": 1,
                "title": 1
              })
            .sort('-time.day')
            .exec(cb) //回调
    },
    getTen: function(page, cb) { //查询十条数据
        return this
            .find()
            .limit(10)
            .skip((page - 1)*10)
            .sort('-time.day')
            .exec(cb) //回调
    },
    findByTitle: function(title, cb) { //根据id查询单条数据
        return this
            .findOne({ title: title })
            .exec(cb)
    },
    findByOne: function(name, day, title, cb) { //根据id查询单条数据
        return this
            .findOne({ 
                'time.day':day,
                'name': name,
                'title':title
                 })
            // .update({$inc: {"pv": 1}})
            .exec(cb)
    },
    updatePv:function(name, day, title, cb) {
        return this
            .update({'time.day':day,
                'name': name,
                'title':title},{$inc: {"pv": 1}})
            .exec(cb)
    },
    edit: function(name, day, title, cb) { //修改文章
        return this
            .findOne({ 
                'time.day':day,
                'name': name,
                'title':title
                 })
            .exec(cb)
    },
    updateOne: function(name, day, title, post, cb) { //更新文章
        return this
            .update(
                {"title":title},
                {$set : { 
                'time.day':day,
                'name': name,
                'title':title,
                'post':post
                 }},
                 {upsert : true})
            .exec(cb)
    },
    removeOne: function(name, day, title, cb) { //更新文章
        return this
            .remove({ 
                'time.day':day,
                'name': name,
                'title':title
                 })
            .exec(cb)
    },
    findByUser: function(name, cb) { //根据用户查该用户所有数据
        return this
            .find({ 'name': name })
            .exec(cb)
    },
    updateComment: function(name, day, title, comment, cb) { //更新留言
        return this
            .update(
                {"title":title,
                  'name': name,
                'time.day':day},
                {$push: {"comments": comment}
                 },
                 {upsert : true})
            .exec(cb)
    }
}
var  Posts = mongoose.model('post', PostSchema); // 编译生成Movie 模型
module.exports = Posts
//留言板块
var    mongoose = require('mongoose');
//申明一个mongoose对象
var CommentSchema = new mongoose.Schema({
    name: String,
    time: Object,
    title: String,
    comments: Array
})

//每次执行都会调用,时间更新操作
CommentSchema.pre('save', function(next) {
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
CommentSchema.statics = {
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
var  Comments = mongoose.model('post', CommentSchema); // 编译生成Movie 模型
module.exports = Comments
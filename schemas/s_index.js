var mongoose = require('mongoose');

//申明一个mongoons对象
var IndexSchema = new mongoose.Schema({
    a_title: String,
    a_img: String,
    a_con: String
})

//每次执行都会调用,时间更新操作
IndexSchema.pre('save', function(next) {
    if (this.isNew) {
        this.meta.createAt = this.meta.updateAt = Date.now();
    } else {
        this.meta.updateAt = Date.now();
    }

    next();
})

//查询的静态方法
IndexSchema.statics = {
    fetch: function(cb) { //查询所有数据
        //console.log('cb',cb);
        return this
            .find()
            .limit(5)//查询五条
            //.sort('paw') //排序
            .exec(cb) //回调
    },
    findById: function(id, cb) { //根据id查询单条数据
        return this
            .findOne({ _id: id })
            .exec(cb)
    }
}

//暴露出去的方法
module.exports = IndexSchema
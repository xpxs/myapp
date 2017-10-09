var mongoose = require('mongoose');

//申明一个mongoose对象
var UsersSchema = new mongoose.Schema({
    name: String,
    password: String,
    email: String
})

//查询的静态方法
UsersSchema.statics = {
    fetch: function(cb) { //查询所有数据
        //console.log('cb',cb);
        return this
            .find()
            .limit(5)//查询五条
            //.sort('paw') //排序
            .exec(cb) //回调
    },
    findById: function(name, cb) { //根据id查询单条数据
        return this
            .findOne({ name: name })
            .exec(cb)
    }
}

//暴露出去的方法
module.exports = UsersSchema
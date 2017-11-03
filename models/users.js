<<<<<<< HEAD
var    mongoose = require('mongoose');
//申明一个mongoose对象
var UsersSchema = new mongoose.Schema({
    name: String,
    password: String,
    email: String,
    usersrc: String,
    autograph: String
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
    findById: function(name, cb) { //根据name查询数据
        return this
            .findOne({ name: name })
            .exec(cb)
    },
    userImgEditor: function(name, usersrc, cb) { //添加修改头像
            return this
            .update(
                {"name":name},
                {$set: {"usersrc": usersrc}
                 },
                 {upsert : true})
            .exec(cb)

    },
    userAutograph: function(name, autograph, cb) { //添加签名
        return this
            .update(
                {"name":name},
                {$set: {"autograph": autograph}
                 },
                 {upsert : true})
            .exec(cb)
    }
}

var  Users = mongoose.model('users', UsersSchema); // 编译生成Movie 模型 users为集合名称 集合必须已s结尾
=======
var    mongoose = require('mongoose');
//申明一个mongoose对象
var UsersSchema = new mongoose.Schema({
    name: String,
    password: String,
    email: String,
    usersrc: String,
    autograph: String
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
    findById: function(name, cb) { //根据name查询数据
        return this
            .findOne({ name: name })
            .exec(cb)
    },
    userImgEditor: function(name, usersrc, cb) { //添加修改头像
        return this
            .update(
                {"name":name},
                {$set: {"usersrc": usersrc}
                 },
                 {upsert : true})
            .exec(cb)
    },
    userAutograph: function(name, autograph, cb) { //添加签名
        return this
            .update(
                {"name":name},
                {$set: {"autograph": autograph}
                 },
                 {upsert : true})
            .exec(cb)
    }
}

var  Users = mongoose.model('users', UsersSchema); // 编译生成Movie 模型 users为集合名称 集合必须已s结尾
>>>>>>> parent of 942e1fa... 不同的个人中心显示页面
module.exports = Users
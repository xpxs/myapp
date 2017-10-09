var    mongoose = require('mongoose');
var UsersSchema = require('../schemas/users'); //拿到导出的数据集模块
var       Users = mongoose.model('users', UsersSchema); // 编译生成Movie 模型 users为集合名称 集合必须已s结尾
module.exports = Users
var    mongoose = require('mongoose');
var PostSchema = require('../schemas/s_post'); //拿到导出的数据集模块
var       Posts = mongoose.model('post', PostSchema); // 编译生成Movie 模型
module.exports = Posts
var    mongoose = require('mongoose');
var IndexSchema = require('../schemas/s_index'); //拿到导出的数据集模块
var       Index = mongoose.model('article_table', IndexSchema); // 编译生成Movie 模型
module.exports = Index
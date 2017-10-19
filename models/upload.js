//下载模块
var  multer  = require('multer');
var  storage = multer.diskStorage({
 //设置上传后文件路径
 destination: function (req, file, cb) {
  cb(null, './public/uploads')
 }, 
 //给上传文件重命名，获取添加后缀名
 filename: function (req, file, cb) {
  var fileFormat = (file.originalname).split(".");
  cb(null, file.fieldname + '-' + Date.now() + "." + fileFormat[fileFormat.length - 1]);
  }
});  
//添加配置文件到multer对象。
var upload = multer({ storage: storage });

//暴露出去的方法
module.exports = upload;
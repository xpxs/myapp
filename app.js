var      express = require('express');
var         path = require('path');
var      favicon = require('serve-favicon');
var       logger = require('morgan');
var cookieParser = require('cookie-parser');
var   bodyParser = require('body-parser');
var     mongoose = require('mongoose');
var        flash = require('connect-flash');
var      session = require('express-session');
var   MongoStore = require('connect-mongo')(session);

mongoose.Promise = global.Promise; 
mongoose.connect('mongodb://127.0.0.1:27017/tpblog',{useMongoClient: true}); //连接到数据库
var db = mongoose.connection;

db.cookieSecret = 'myblog'; //cookieSecret 用于 Cookie 加密与数据库无关
// 连接成功
db.on('open', function(){
    console.log('-------- MongoDB 数据库连接成功 --------');
});
// 连接失败
db.on('error', function(){
    console.log('-------- MongoDB 数据库连接失败 --------');
});

var routes = require('./routes/route');//加载页面主路由

var app = express();

// view engine setup
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));//网站角标
app.use(logger('dev'));//加载日志中间件
app.use(bodyParser.json());//加载解析json的中间件
app.use(bodyParser.urlencoded({ extended: false }));//加载解析urlencoded请求体的中间件
app.use(cookieParser());//加载解析cookie的中间件
app.use(express.static(path.join(__dirname, 'public')));//设置public文件夹为存放静态文件的目录

app.use(session({
  resave: false,  
  saveUninitialized: true,  
  secret: db.cookieSecret,
  key: db.name,//cookie name
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
  store: new MongoStore({
    mongooseConnection: db, // mongoose 连接
    host: db.host,
    port: db.port
  })
}));
app.use(flash());

routes(app);

// set flash
app.use(function (req, res, next) {
  res.locals.errors = req.flash('error');
  res.locals.infos = req.flash('success');
  next();
});
module.exports = app; //导出app实例供其他模块调用

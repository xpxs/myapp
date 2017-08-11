var      express = require('express');
var         path = require('path');
var      favicon = require('serve-favicon');
var       logger = require('morgan');
var cookieParser = require('cookie-parser');
var   bodyParser = require('body-parser');
var     mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/tpblog'); //连接到本地数据库
var db = mongoose.connection;

// 连接成功
db.on('open', function(){
    console.log('-------- MongoDB 数据库连接成功 --------');
});
// 连接失败
db.on('error', function(){
    console.log('-------- MongoDB 数据库连接失败 --------');
});

var index = require('./routes/index'); //加载应用路由
var users = require('./routes/users'); //加载应用路由

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index); //路由挂载到应用
app.use('/users', users); //路由挂载到应用

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  console.log("err",err);
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
  // console.log("message",res.locals.message);
  // console.log("error",res.locals.error);
});

// app.disable('etag');

module.exports = app;

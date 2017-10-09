var mongoose = require('mongoose'); //导入mongoose模块
var   crypto = require('crypto');
var markdown = require('markdown').markdown;

//数据集模块
var    Index = require('../models/m_index'); //导入模型数据模块
var    Users = require('../models/users'); //导入模型数据模块
var    Posts = require('../models/m_post'); //导入模型数据模块


module.exports = function(app) {
  app.get(['/', '/index'], function(req, res, next) { //主页路由
    // console.log("req",req);
    Index.fetch(function(err, data) {
      if (err) {
        console.log(err);
      }
      res.render('index', { title: '首页', data: data }) //这里也可以json的格式直接返回数据res.json({data: users});
    })
  })
  app.get('/users', function(req, res, next) { //用户
    var name = "tanpeng";
    Users.findById(name, function(err, data) {
      console.log("data", data);
    })
  })
  //注册页面get请求
  app.get('/reg', function(req, res) {
    res.render('reg', {
      title: '注册',
      error: req.flash('error'),
      info: req.flash('info'),
      user: req.session.user
    });
  });
  //注册页面post提交请求
  app.post('/reg', function(req, res, next) {
    var name = req.body.name,
      password = req.body.password,
      password_re = req.body['password-repeat'];
    if(!trim(name)){
      req.flash('error', '用户名不能为空!')
      return res.redirect('/reg'); //返回注册页
    }
    if(!trim(password)){
      req.flash('error', '密码不能为空!')
      return res.redirect('/reg'); //返回注册页
    }
    //检验用户两次输入的密码是否一致
    if (password_re != password) {
      //console.log("req.session.flash.error",req.session.flash.error)
      req.flash('error', '两次输入的密码不一致!')
      return res.redirect('/reg'); //返回注册页
    }
    //生成密码的 md5 值
    var md5 = crypto.createHash('md5'),
      password = md5.update(req.body.password).digest('hex');
    var newUser = new Users({
      name: name,
      password: password,
      email: req.body.email
    });

    Users.findById(newUser.name, function(err, user) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      if (user) {
        req.flash('error', '用户已存在!');
        return res.redirect('/reg'); //返回注册页
      }
      //如果不存在则新增用户
      newUser.save(function(err, user) {
        if (err) {
          req.flash('error', err);
          return res.redirect('/reg'); //注册失败返回主册页
        }
        req.session.user = user; //用户信息存入 session
        req.flash('info', '注册成功!');
        res.redirect('/reg'); //注册成功后返回主页
      });
    })
  });

  //登录路由get请求
  app.get('/login', checkNotLogin);
  app.get('/login', function(req, res) {
    res.render('login', {
      title: '登录',
      error: req.flash('error'),
      info: req.flash('info'),
      user: req.session.user
    });
  });

  //登录路由post提交请求
  app.post('/login', checkNotLogin);
  app.post('/login', function(req, res) {
    if(!trim(req.body.name)){
      req.flash('error', '请输入用户名!')
      return res.redirect('/login'); //返回注册页
    }
    if(!trim(req.body.password)){
      req.flash('error', '请输入密码!')
      return res.redirect('/login'); //返回注册页
    }
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    Users.findById(req.body.name, function(err, user) {
      console.log("user", user)
      if (!user) {
        req.flash('error', '用户不存在!');
        return res.redirect('/login'); //用户不存在则跳转到登录页
      }
      //检查密码是否一致
      if (user.password != password) {
        req.flash('error', '密码错误!');
        return res.redirect('/login'); //密码错误则跳转到登录页
      }
      //用户名密码都匹配后，将用户信息存入 session
      req.session.user = user;
      req.flash('info', '登陆成功!');
      res.redirect('/'); //登陆成功后跳转到主页
    })
  });

  //文章列表get请求
  app.get('/post', checkLogin);
  app.get('/post', function(req, res) {
    res.render('post', { 
      title: '发表',
      error: req.flash('error'),
      info: req.flash('info')
    });
  });
  app.get('/postGet', function(req, res, next) {
    Posts.fetch(function(err, data) {//名称自定义
      data.forEach(function (item) {
        item.post = markdown.toHTML(item.post);//去掉换行
      });
      console.log('data',data);
      if (err) {
        console.log(err);
      }
      res.render('postGet', { title: '发表后展示',data:data})
    }); 
  });
  //发表文章 post 提交请求
  app.post('/post', checkLogin);
  app.post('/post', function(req, res) {
    if(!trim(req.body.title)){
      req.flash('error', '文章标题不能为空!')
      return res.redirect('/post'); //返回注册页
    }
    if(!trim(req.body.post)){
      req.flash('error', '内容不能为空!')
      return res.redirect('/post'); //返回注册页
    }
    var currentUser = req.session.user,
        post = new Posts({
          name: currentUser.name, 
          title: trim(req.body.title), 
          post: trim(req.body.post)
        });
    Posts.findById(req.body.title, function(err, title) {
      if (title) {
        req.flash('error', '文章标题已存在');
        return res.redirect('/post'); //返回发布页
      }
      post.save(function (err) {
        if (err) {
          req.flash('error', err); 
          return res.redirect('/');
        }
        req.flash('info', '发布成功!');
        res.redirect('/');//发表成功跳转到主页
      });
    })
  });
  //退出登录路由get请求
  app.get('/logout', checkLogin);
  app.get('/logout', function (req, res) {
    req.session.user = null;
    req.flash('info', '退出成功!');
    res.redirect('/');
  });

  function checkLogin(req, res, next) {
    if (!req.session.user) {
      req.flash('error', '未登录!'); 
      res.redirect('/login');
    }
    next();
  }

  function checkNotLogin(req, res, next) {
    if (req.session.user) {
      req.flash('error', '已登录!'); 
      res.redirect('back');
    }
    next();
  }
  //去除空格函数
  function trim(str) {
    return str.replace(/(^\s+)|(\s+$)/g, "");
  }
};
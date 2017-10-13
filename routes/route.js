var mongoose = require('mongoose'); //导入mongoose模块
var crypto = require('crypto');
var markdown = require('markdown').markdown;

//数据集模块
var Index = require('../models/index'); //导入模型数据模块
var Users = require('../models/users'); //导入模型数据模块
var Posts = require('../models/post'); //导入模型数据模块

var upload = require('../models/upload'); //导入图片上传文件模块

module.exports = function(app) {
  //主页请求
  app.get(['/', '/index'], function(req, res, next) { //主页路由
    var page = req.query.p ? parseInt(req.query.p) : 1;
    //检查用户是否存在
    var g = {};
    Posts.getAll(function (err, total){
      g.total = total;
    })
    Posts.getTen(page, function (err, data) {
      if (err) {
        data = [];
      } 
      res.render('index', {
        title: '主页',
        posts: data,
        page: page,
        isFirstPage: (page - 1) == 0,
        isLastPage: ((page - 1) * 10 + data.length) == g.total,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  })

  //查看该用户下的所有文章
  // app.get('/user/:name', checkLogin); //限制登录能看
  app.get('/user/:name', function(req, res, next) { //用户
    Users.findById(req.params.name, function(err, user) {
      if (!user) {
        req.flash('error', '用户不存在!');
        return res.redirect('/'); //用户不存在则跳转到主页
      }
      Posts.findByUser(user.name, function(err, data) {
        if (err) {
          req.flash('error', err);
          return res.redirect('/');
        }
        data.forEach(function(item) {
          item.post = markdown.toHTML(item.post); //markdown 转html
        });

        res.render('user', {
          title: user.name,
          posts: data,
          user: req.session.user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });
      });
    })
  })

  //打开文章查看
  // app.get('/user/:name/:day/:title', checkLogin); //限制登录能看
  app.get('/user/:name/:day/:title', function(req, res, next) { //用户
    Users.findById(req.params.name, function(err, user) {
      if (!user) {
        req.flash('error', '用户不存在!');
        return res.redirect('/'); //用户不存在则跳转到主页
      }
      Posts.findByOne(req.params.name, req.params.day, req.params.title, function(err, data) {
        if (!data) {
          req.flash('error', "没有该条数据");
          return res.redirect('/user/' + req.params.name);
        }
        data.post = markdown.toHTML(data.post); //markdown 转html
        res.render('article', {
          title: req.params.title,
          posts: data,
          user: req.session.user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });
      });
    });
  })

  //针对文章留言
  app.post('/user/:name/:day/:title', function(req, res, next) { //留言
    var date = new Date(),
        time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
               date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
    var comment = {
        name: req.body.name,
        email: req.body.email,
        website: req.body.website,
        time: time,
        content: req.body.content
    };
    Posts.updateComment(req.params.name, req.params.day, req.params.title, comment, function (err) {
      //var url = '/user/'+req.params.name+'/'+req.params.day+'/'+req.params.title;
      if (err) {
        req.flash('error', err); 
        return res.redirect('back');
      }
      req.flash('success', '留言成功!');
      res.redirect('back');//成功！返回文章页
    });
  })

  //编辑文章请求
  app.get('/edit/:name/:day/:title', checkLogin);
  app.get('/edit/:name/:day/:title', function(req, res) {
    var currentUser = req.session.user;
    Posts.edit(currentUser.name, req.params.day, req.params.title, function(err, data) {
      if (!data) {
        req.flash('error', "没有该条数据");
        return res.redirect('/user/' + currentUser.name);
      }
      //data.post = markdown.toHTML(data.post); //markdown 转html
      res.render('edit', {
        title: '编辑',
        posts: data,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  //编辑文章提交请求
  app.post('/edit/:name/:day/:title', checkLogin);
  app.post('/edit/:name/:day/:title', function (req, res) {
    var currentUser = req.session.user;
    Posts.updateOne(currentUser.name, req.params.day, req.params.title, req.body.post, function (err) {
      var url = encodeURI('/user/' + req.params.name + '/' + req.params.day + '/' + req.params.title);
      if (err) {
        req.flash('error', err); 
        return res.redirect(url);//出错！返回文章页
      }
      req.flash('success', '修改成功!');
      res.redirect(url);//成功！返回文章页
    });
  });

  //删除文章get请求
  app.get('/remove/:name/:day/:title', checkLogin);
  app.get('/remove/:name/:day/:title', function (req, res) {
    var currentUser = req.session.user;
    Posts.removeOne(currentUser.name, req.params.day, req.params.title, function (err) {
      if (err) {
        req.flash('error', err); 
        return res.redirect('back');//出错！
      }
      req.flash('success', '删除成功!');
      res.redirect('/user/'+ req.params.name);//成功！个人中心
    });
  });

  //注册页面get请求
  app.get('/reg', function(req, res) {
    res.render('reg', {
      title: '注册',
      success: req.flash('success').toString(),
      error: req.flash('error').toString(),
      user: req.session.user
    });
  });
  //注册页面post提交请求
  app.post('/reg', function(req, res, next) {
    var name = req.body.name,
      password = req.body.password,
      password_re = req.body['password-repeat'];
    if (!trim(name)) {
      req.flash('error', '用户名不能为空!')
      return res.redirect('/reg'); //返回注册页
    }
    if (!trim(password)) {
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
        req.flash('success', '注册成功!');
        res.redirect('/reg'); //注册成功后返回主页
      });
    })
  });

  //登录路由get请求
  app.get('/login', checkNotLogin);
  app.get('/login', function(req, res) {
    res.render('login', {
      title: '登录',
      success: req.flash('success').toString(),
      error: req.flash('error').toString(),
      user: req.session.user
    });
  });

  //登录路由post提交请求
  app.post('/login', checkNotLogin);
  app.post('/login', function(req, res) {
    if (!trim(req.body.name)) {
      req.flash('error', '请输入用户名!')
      return res.redirect('/login'); //返回注册页
    }
    if (!trim(req.body.password)) {
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
      req.flash('success', '登陆成功!');
      res.redirect('/'); //登陆成功后跳转到主页
    })
  });

  //文章列表get请求
  app.get('/post', checkLogin);
  app.get('/post', function(req, res) {
    res.render('post', {
      title: '发表',
      error: req.flash('error').toString(),
      success: req.flash('success').toString(),
      user: req.session.user
    });
  });
  //发表文章 post 提交请求
  app.post('/post', checkLogin);
  app.post('/post', function(req, res) {
    if (!trim(req.body.title)) {
      req.flash('error', '文章标题不能为空!')
      return res.redirect('/post'); //返回注册页
    }
    if (!trim(req.body.post)) {
      req.flash('error', '内容不能为空!')
      return res.redirect('/post'); //返回注册页
    }
    var currentUser = req.session.user,
      tags = [req.body.tag1, req.body.tag2, req.body.tag3],
      post = new Posts({
        name: currentUser.name,
        title: trim(req.body.title),
        post: trim(req.body.post),
        tags:tags
      });
    Posts.findByTitle(req.body.title, function(err, title) {
      if (title) {
        req.flash('error', '文章标题已存在');
        return res.redirect('/post'); //返回发布页
      }
      post.save(function(err) {
        if (err) {
          req.flash('error', err);
          return res.redirect('/');
        }
        req.flash('success', '发布成功!');
        res.redirect('/'); //发表成功跳转到主页
      });
    })
  });

  //退出登录路由get请求
  app.get('/logout', checkLogin);
  app.get('/logout', function(req, res) {
    req.session.user = null;
    req.flash('success', '退出成功!');
    res.redirect('/');
  });

  //上传图片
  app.get('/upload', checkLogin);
  app.get('/upload', function(req, res) {
    res.render('upload', {
      title: '文件上传',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

  //上传图片提交
  app.post('/upload', checkLogin);
  app.post('/upload', upload.array('up', 4), function(req, res) {
    req.flash('success', '文件上传成功!');
    res.redirect('/upload');
  });

  //存档页面效果
  app.get('/archive', function (req, res) {
    Posts.getArchive(function (err, data) {
      console.log("data",data)
      if (err) {
        req.flash('error', err); 
        return res.redirect('/');
      }
      res.render('archive', {
        title: '存档',
        posts: data,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  //获取文章标签
  app.get('/tags', function (req, res) {
    Posts.getTags(function (err, data) {
      console.log("data",data)
      if (err) {
        req.flash('error', err); 
        return res.redirect('/');
      }
      res.render('tags', {
        title: '标签',
        posts: data,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  //获得tag标签下的所有页面
  app.get('/tags/:tag', function (req, res) {
    Posts.getTag(req.params.tag, function (err, data) {
      console.log("data",data)
      if (err) {
        req.flash('error',err); 
        return res.redirect('/');
      }
      res.render('tag', {
        title: 'TAG:' + req.params.tag,
        posts: data,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });
  //未登录函数
  function checkLogin(req, res, next) {
    if (!req.session.user) {
      req.flash('error', '未登录!');
      res.redirect('/login');
    }
    next();
  }
  //已登录函数
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
<<<<<<< HEAD
var mongoose = require('mongoose'); //导入mongoose模块
var crypto = require('crypto');
var markdown = require('markdown').markdown;

//数据集模块
var Index = require('../models/index'); //导入模型数据模块
var Users = require('../models/users'); //导入模型数据模块
var Posts = require('../models/post'); //导入模型数据模块
var Articles = require('../models/article'); //导入模型数据模块
var  News = require('../models/news'); //导入模型数据模块

var upload = require('../models/upload'); //导入图片上传文件模块
var info = {
  "data":"",
  "msg":"",
  "state":1
}
module.exports = function(app) {
  //主页请求
  app.get(['/', '/index'], function(req, res, next) { //主页路由
    console.log("req.session",req.session)
    Articles.getArticleTen(function (err, articles){
      if (err) {data = [];}
      Posts.getPostTen(function (err, posts) {
        if (err) {data = [];}
        News.getNewsTen(function (err, news){
          if (err) {data = [];}
          res.render('index', {
            title: '主页',
            news:news,
            articles: articles,
            posts: posts,
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
          })
        })
      })
    })
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
        // data.forEach(function(item) {
        //   item.post = markdown.toHTML(item.post); //markdown 转html
        // });
        res.render('post/user', {
          title: user.name,
          posts: data,
          imgsrc: user.usersrc,
          autograph: user.autograph,
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
        // data.post = markdown.toHTML(data.post); //markdown 转html
        res.render('post/article', {
          title: req.params.title,
          posts: data,
          user: req.session.user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });
        //pv浏览量更新
        Posts.updatePv(req.params.name, req.params.day, req.params.title, function(err, data) {
          if (err) {
            req.flash('error', "没有该条数据");
            return res.redirect('/user/' + req.params.name);
          }
        });
      });
    });
  })

  //科技新闻列表
  app.get('/article/list',function(req, res ,next) {
    var page = req.query.p ? parseInt(req.query.p) : 1;
    var g = {}
    Articles.getArticleAll(function (err, total){
      g.ArticleTotal = total;
    });
    Articles.getArticleTwenty(page, function (err, articles) {
      if (err) {
        articles = [];
      }
      res.render('article/list', {
        title: '主页',
        articles: articles,
        page: page,
        isFirstPage: (page - 1) == 0,
        isLastPage: ((page - 1) * 20 + articles.length) == g.ArticleTotal,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  })
  //科技新闻查看
  app.get('/article/list/:title', function(req, res, next) { //用户
      Articles.getArticleTitle(req.params.title, function(err, articles) {
        if (!articles) {
          req.flash('error', "没有该文章");
          return res.redirect('/article/' + req.params.title);
        }
        // data.articleText = markdown.toHTML(data.articleText); //markdown 转html
        res.render('article/article', {
          title: req.params.title,
          articles: articles,
          user: req.session.user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });
      });
  })

  //社会新闻列表
  app.get('/news/list',function(req, res ,next) {
    var page = req.query.p ? parseInt(req.query.p) : 1;
    var g = {}
    News.getNewsAll(function (err, total){
      g.NewsTotal = total;
    });
    News.getNewsTwenty(page, function (err, news) {
      if (err) {
        news = [];
      }
      res.render('news/list', {
        title: '主页',
        news: news,
        page: page,
        isFirstPage: (page - 1) == 0,
        isLastPage: ((page - 1) * 20 + news.length) == g.NewsTotal,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  })
  //科技新闻查看
  app.get('/news/list/:title', function(req, res, next) { //用户
      News.getNewsTitle(req.params.title, function(err, news) {
        if (!news) {
          req.flash('error', "没有该文章");
          return res.redirect('/news/' + req.params.title);
        }
        // data.articleText = markdown.toHTML(data.articleText); //markdown 转html
        res.render('news/article', {
          title: req.params.title,
          news: news,
          user: req.session.user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
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
  app.get('/edit/:name/:day/:title', function(req, res, next) {
    var currentUser = req.session.user;
    Posts.edit(currentUser.name, req.params.day, req.params.title, function(err, data) {
      if (!data) {
        req.flash('error', "没有该条数据");
        return res.redirect('/user/' + currentUser.name);
      }
      //data.post = markdown.toHTML(data.post); //markdown 转html
      res.render('post/edit', {
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
  app.get('/remove/:name/:day/:title', function (req, res, next) {
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
  app.get('/reg', function(req, res, next) {
    res.render('register/reg');
  });
  //注册页面post提交请求
  app.post('/reg', function(req, res, next) {
    var resData = info;
    var name = req.body.name,
      password = req.body.password,
      password_re = req.body['password_repeat'];
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
        resData.state = 0;
        resData.msg = err;
        resData.data = null;
        return res.json(resData);
      }
      if (user) {
        resData.state = 0;
        resData.msg = "用户已存在!";
        resData.data = null;
        return res.json(resData);
      }
      //如果不存在则新增用户
      newUser.save(function(err, user) {
        if (err) {
          resData.state = 0;
          resData.msg = err;
          resData.data = null;
          return res.json(resData);
        }
        req.session.user = user; //用户信息存入 session
        resData.state = 1;
        resData.msg = "注册成功";
        resData.data = null;
        return res.json(resData);
      });
    })
  });

  //登录路由get请求
  app.get('/login', checkNotLogin);
  app.get('/login', function(req, res, next) {
    res.render('register/login', {
      user: req.session.user
    });
  });

  //登录路由post提交请求
  app.post('/login', checkNotLogin);
  app.post('/login', function(req, res) {
    var resData = info;
    var md5 = crypto.createHash('md5'),
    password = md5.update(req.body.password).digest('hex');
    Users.findById(req.body.name, function(err, user) {
      console.log("user",user)
      //用户不存在
      if (!user) {
        resData.state = 0;
        resData.msg = "用户不存在!";
        resData.data = null;
        return res.json(resData);
      }
      //检查密码是否一致
      if (user.password != password) {
        resData.state = 0;
        resData.msg = "密码错误!";
        resData.data = null;
        return res.json(resData);
      }
      //用户名密码都匹配后，将用户信息存入 session
      req.session.user = user;
      resData.state = 1;
      resData.msg = "登录成功!";
      resData.data = null;
      return res.json(resData);
    })
  });

  //文章列表get请求
  app.get('/post', checkLogin);
  app.get('/post', function(req, res, next) {
    res.render('post/post', {
      title: '发表',
      error: req.flash('error').toString(),
      success: req.flash('success').toString(),
      user: req.session.user
    });
  });
  //发表文章 post 提交请求
  app.post('/post', checkLogin);
  app.post('/post', function(req, res, next) {
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
  app.get('/logout', function(req, res, next) {
    req.session.user = null;
    req.flash('success', '退出成功!');
    res.redirect('/');
  });

  //上传图片
  app.get('/upload', checkLogin);
  app.get('/upload', function(req, res, next) {
    res.render('pub/upload', {
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
    res.redirect('back');
  });//上传图片提交

  app.post('/uploadUserImg', checkLogin);
  app.post('/uploadUserImg', upload.array('userImg', 1), function(req, res, next) {
    var usersrc = req.files[0].path.replace('public','');
    console.log("usersrc",usersrc)
    var currentUser = req.session.user;
    Users.userImgEditor(currentUser.name, usersrc, function(err, users) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/user/'+ currentUser.name);
      }
    });
    res.json(usersrc);
  });

  app.post('/autograph', checkLogin);
  app.post('/autograph', function(req, res, next) {
    var currentUser = req.session.user;
    var autograph = req.body.value;
    console.log("autograph",autograph)
    Users.userAutograph(currentUser.name, autograph, function(err, users) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/user/'+ currentUser.name);
      }
    });
    res.json('个性签名修改成功!');
  });

  //存档页面效果
  app.get('/archive', function (req, res, next) {
    Posts.getArchive(function (err, data) {
      console.log("data",data)
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('post/archive', {
        title: '存档',
        posts: data,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  //获取文章标签
  app.get('/tags', function (req, res, next) {
    Posts.getTags(function (err, data) {
      console.log("data",data)
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('post/tags', {
        title: '标签',
        posts: data,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  //获得tag标签下的所有页面
  app.get('/tags/:tag', function (req, res, next) {
    Posts.getTag(req.params.tag, function (err, data) {
      console.log("data",data)
      if (err) {
        req.flash('error',err);
        return res.redirect('/');
      }
      res.render('post/tag', {
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
=======
var mongoose = require('mongoose'); //导入mongoose模块
var crypto = require('crypto');
var markdown = require('markdown').markdown;

//数据集模块
var Index = require('../models/index'); //导入模型数据模块
var Users = require('../models/users'); //导入模型数据模块
var Posts = require('../models/post'); //导入模型数据模块
var Articles = require('../models/article'); //导入模型数据模块
var  News = require('../models/news'); //导入模型数据模块

var upload = require('../models/upload'); //导入图片上传文件模块
module.exports = function(app) {
  //主页请求
  app.get(['/', '/index'], function(req, res, next) { //主页路由
    console.log("req.session",req.session)
    Articles.getArticleTen(function (err, articles){
      if (err) {data = [];}
      Posts.getPostTen(function (err, posts) {
        if (err) {data = [];}
        News.getNewsTen(function (err, news){
          if (err) {data = [];}
          res.render('index', {
            title: '主页',
            news:news,
            articles: articles,
            posts: posts,
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
          })
        })
      })
    })
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
        // data.forEach(function(item) {
        //   item.post = markdown.toHTML(item.post); //markdown 转html
        // });
        res.render('post/user', {
          title: user.name,
          posts: data,
          imgsrc: user.usersrc,
          autograph: user.autograph,
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
        // data.post = markdown.toHTML(data.post); //markdown 转html
        res.render('post/article', {
          title: req.params.title,
          posts: data,
          user: req.session.user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });
        //pv浏览量更新
        Posts.updatePv(req.params.name, req.params.day, req.params.title, function(err, data) {
          if (err) {
            req.flash('error', "没有该条数据");
            return res.redirect('/user/' + req.params.name);
          }
        });
      });
    });
  })

  //科技新闻列表
  app.get('/article/list',function(req, res ,next) {
    var page = req.query.p ? parseInt(req.query.p) : 1;
    var g = {}
    Articles.getArticleAll(function (err, total){
      g.ArticleTotal = total;
    });
    Articles.getArticleTwenty(page, function (err, articles) {
      if (err) {
        articles = [];
      }
      res.render('article/list', {
        title: '主页',
        articles: articles,
        page: page,
        isFirstPage: (page - 1) == 0,
        isLastPage: ((page - 1) * 20 + articles.length) == g.ArticleTotal,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  })
  //科技新闻查看
  app.get('/article/list/:title', function(req, res, next) { //用户
      Articles.getArticleTitle(req.params.title, function(err, articles) {
        if (!articles) {
          req.flash('error', "没有该文章");
          return res.redirect('/article/' + req.params.title);
        }
        // data.articleText = markdown.toHTML(data.articleText); //markdown 转html
        res.render('article/article', {
          title: req.params.title,
          articles: articles,
          user: req.session.user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });
      });
  })

  //社会新闻列表
  app.get('/news/list',function(req, res ,next) {
    var page = req.query.p ? parseInt(req.query.p) : 1;
    var g = {}
    News.getNewsAll(function (err, total){
      g.NewsTotal = total;
    });
    News.getNewsTwenty(page, function (err, news) {
      if (err) {
        news = [];
      }
      res.render('news/list', {
        title: '主页',
        news: news,
        page: page,
        isFirstPage: (page - 1) == 0,
        isLastPage: ((page - 1) * 20 + news.length) == g.NewsTotal,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  })
  //科技新闻查看
  app.get('/news/list/:title', function(req, res, next) { //用户
      News.getNewsTitle(req.params.title, function(err, news) {
        if (!news) {
          req.flash('error', "没有该文章");
          return res.redirect('/news/' + req.params.title);
        }
        // data.articleText = markdown.toHTML(data.articleText); //markdown 转html
        res.render('news/article', {
          title: req.params.title,
          news: news,
          user: req.session.user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
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
  app.get('/edit/:name/:day/:title', function(req, res, next) {
    var currentUser = req.session.user;
    Posts.edit(currentUser.name, req.params.day, req.params.title, function(err, data) {
      if (!data) {
        req.flash('error', "没有该条数据");
        return res.redirect('/user/' + currentUser.name);
      }
      //data.post = markdown.toHTML(data.post); //markdown 转html
      res.render('post/edit', {
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
  app.get('/remove/:name/:day/:title', function (req, res, next) {
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
  app.get('/reg', function(req, res, next) {
    res.render('register/reg', {
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
        res.redirect('/'); //注册成功后返回主页
      });
    })
  });

  //登录路由get请求
  app.get('/login', checkNotLogin);
  app.get('/login', function(req, res, next) {
    res.render('register/login', {
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
      return res.redirect('/login'); //返回登录页
    }
    if (!trim(req.body.password)) {
      req.flash('error', '请输入密码!')
      return res.redirect('/login'); //返回登录页
    }
    var md5 = crypto.createHash('md5'),
      password = md5.update(req.body.password).digest('hex');
    Users.findById(req.body.name, function(err, user) {
      if (!user) {
        req.flash('error', '用户不存在!');
        return res.redirect('/login'); //返回登录页
      }
      //检查密码是否一致
      if (user.password != password) {
        req.flash('error', '密码错误!');
        return res.redirect('/login'); //返回登录页
      }
      //用户名密码都匹配后，将用户信息存入 session
      req.session.user = user;
      req.flash('success', '登陆成功!');
      res.redirect('/'); //登陆成功后跳转到主页
    })
  });

  //文章列表get请求
  app.get('/post', checkLogin);
  app.get('/post', function(req, res, next) {
    res.render('post/post', {
      title: '发表',
      error: req.flash('error').toString(),
      success: req.flash('success').toString(),
      user: req.session.user
    });
  });
  //发表文章 post 提交请求
  app.post('/post', checkLogin);
  app.post('/post', function(req, res, next) {
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
  app.get('/logout', function(req, res, next) {
    req.session.user = null;
    req.flash('success', '退出成功!');
    res.redirect('/');
  });

  //上传图片
  app.get('/upload', checkLogin);
  app.get('/upload', function(req, res, next) {
    res.render('pub/upload', {
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
    res.redirect('back');
  });//上传图片提交

  app.post('/uploadUserImg', checkLogin);
  app.post('/uploadUserImg', upload.array('userImg', 1), function(req, res, next) {
    var usersrc = req.files[0].path.replace('public','');
    var currentUser = req.session.user;
    Users.userImgEditor(currentUser.name, usersrc, function(err, users) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/user/'+ currentUser.name);
      }
    });
    res.json(req.files[0].path.replace('public',''));
  });

  app.post('/autograph', checkLogin);
  app.post('/autograph', function(req, res, next) {
    var currentUser = req.session.user;
    var autograph = req.body.value;
    Users.userAutograph(currentUser.name, autograph, function(err, users) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/user/'+ currentUser.name);
      }
    });
    res.json('个性签名修改成功!');
  });

  //存档页面效果
  app.get('/archive', function (req, res, next) {
    Posts.getArchive(function (err, data) {
      console.log("data",data)
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('post/archive', {
        title: '存档',
        posts: data,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  //获取文章标签
  app.get('/tags', function (req, res, next) {
    Posts.getTags(function (err, data) {
      console.log("data",data)
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('post/tags', {
        title: '标签',
        posts: data,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  //获得tag标签下的所有页面
  app.get('/tags/:tag', function (req, res, next) {
    Posts.getTag(req.params.tag, function (err, data) {
      console.log("data",data)
      if (err) {
        req.flash('error',err);
        return res.redirect('/');
      }
      res.render('post/tag', {
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
>>>>>>> parent of 942e1fa... 不同的个人中心显示页面
};
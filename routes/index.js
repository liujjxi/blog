
/*
var express = require('express');
var router = express.Router();
*/

/* GET home page. */
//生成一个路由实例用来捕获访问主页的GET请求，导出这个路由并在app.js中通过app.use('/', routes); 加载
//这样，当访问主页时，就会调用res.render('index', { title: 'Express' });渲染views/index.ejs模版并显示到浏览器中。
/*router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;*/
var crypto=require('crypto'),//生成散列值来加密密码
		User=require('../models/user.js'),
    Post=require('../models/post.js');//User 是一个描述数据的对象，即 MVC 架构中的模型
module.exports = function(app) {
  app.get('/', function (req, res) {
    Post.get(null,function(err,posts){
      if(err){
        posts=[];
      }
      res.render('index', {
        title:'主页',
        user:req.session.user,
        posts:posts,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
      });
    });

    //第一个是模板的名称，即 views 目录下的模板文件名，扩展名 .ejs 可选。第二个参数是传递给模板的数据对象，用于模板翻译。
  });
  app.get('/reg',checkNotLogin);
  app.get('/reg',function(req,res){
  	res.render('reg',{
      title:'注册',
      user:req.session.user,
      success:req.flash('success').toString(),
      error:req.flash('error').toString()
   })
  });
  app.post('/reg',checkNotLogin);
  app.post('/reg',function(req,res){
  	var name=req.body.name,// POST 请求信息解析过后的对象，例如我们要访问 POST 来的表单内的 name="password" 域的值，只需访问 req.body['password'] 或 req.body.password 即可
  			password=req.body.password,
  			password_re=req.body['password-repeat'];
  	//检验用户两次输入的密码是否一致
  	if(password_re!=password){
  		req.flash('error','两次输入的密码不一致');
  		return res.redirect('/reg')
  	}
  	//生产md5值
  	var md5=crypto.createHash('md5'),
  			password=md5.update(req.body.password).digest('hex');
  	var newUser=new User({
  		name:name,
  		password:password,
  		email:req.body.email
  	});
  	//检查用户名是否已经存在
  	User.get(newUser.name,function(err,user){
  		if(err){
  			req.flash('error',err);
  			return res.redirect('/');
  		}
  		if(user){
  			req.flash('error','用户已存在');
  			return res.redirect('/login');
  		}
  		//如果不存在则新增用户
  		newUser.save(function(err,user){
  			if(err){
  				req.flash('error',err);
  				return res.redirect('/reg');
  			}
  			req.session.user=user;//用户信息存入session
  			req.flash('success','注册成功');
  			res.redirect('/');
  		})
  	})
  });
  app.get('/login',checkNotLogin);
	app.get('/login',function(req,res){
    res.render('login', {
      title:'登录',
      user:req.session.user,
      success:req.flash('success').toString(),
      error:req.flash('error').toString()
    });
  });
  app.post('/login',checkNotLogin);
  app.post('/login',function(req,res){
    //生成md5密码
    var md5=crypto.createHash('md5'),
        password=md5.update(req.body.password).digest('hex');
    //检查用户是否存在
    User.get(req.body.name,function(err,user){
      if(!user){
        req.flash('error','用户不存在');
        return res.redirect('/login');
      }  
      //检查密码是否一致
      if(user.password!=password){
        req.flash('error','密码错误');
        res.redirect('/login');
      }  
      //正确后将信息写入session
      req.session.user=user;
      req.flash('success','登录成功');
      res.redirect('/');
    });
  });
  app.get('/post',checkLogin);
  app.get('/post',function(req,res){
    res.render('post', {
      title:'发表',
      user:req.session.user,
      success:req.flash('success').toString(),
      error:req.flash('error').toString()
    });
  });
  app.post('/post',checkLogin);
  app.post('/post',function(req,res){
    var currentUser=req.session.user,
        post=new Post(currentUser.name,req.body.title,req.body.post);
    post.save(function(err){
      if(err){
        req.flash('error',err);
        return res.redirect('/');
      }
      req.flash('success','发布成功');
      res.redirect('/');
    })

  });
  app.get('/logout',checkLogin);
  app.get('/logout',function(req,res){
    req.session.user=null;
    req.flash('success','登出成功');
    res.redirect('/');
  });
/*  app.get('/nswbmw', function (req, res,next) {
	  res.send('hello,world!');
	});*/

  function checkLogin(req,res,next){
    if(!req.session.user){
      req.flash('error','未登录');
      res.redirect('/login');
    }
    next();
  }
  function checkNotLogin(req,res,next){
    if(req.session.user){
      req.flash('error','已登录');
      res.redirect('/');
    }
    next();
  }
};

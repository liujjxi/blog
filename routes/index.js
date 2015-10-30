
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
    Post=require('../models/post.js'),
    Comment=require('../models/comment.js');//User 是一个描述数据的对象，即 MVC 架构中的模型
module.exports = function(app) {
  app.get('/', function (req, res) {
    var page=req.query.p?parseInt(req.query.p):1;
    Post.getTen(null,page,function(err,posts,total){
      if(err){
        posts=[];
      }
      res.render('index', {
        title:'主页',
        user:req.session.user,
        posts:posts,
        page:page,
        isFirstPage:(page-1)==0,
        isLastPage:((page-1)*10+posts.length)==total,
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
  			res.redirect('/login');
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
        tags=[req.body.tag1,req.body.tag2,req.body.tag3],
        post=new Post(currentUser.name,currentUser.head,req.body.title,req.body.post);
    post.save(function(err){
      if(err){
        req.flash('error',err);
        return res.redirect('/');
      }
      req.flash('success','发布成功');
      res.redirect('/');
    })

  });
  app.get('/upload',checkLogin);
  app.get('/upload',function(req,res){
    res.render('upload',{
      title:'文件上传',
      user:req.session.user,
      success:req.flash('success').toString(),
      error:req.flash('error').toString()
    })
  });
  app.post('/upload',checkLogin);
  app.post('/upload',function(req,res){
    req.flash('success','上传成功');
    res.redirect('/upload');
  });
  app.get('/archive',function(req,res){
    Post.getArchive(function(err,posts){
      if(err){
        req.flash('error',err);
        return res.redirect('/');
      }
      res.render('archive',{
        title:'存档',
        posts:posts,
        user:req.session.user,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
      })
    })
  });
  app.get('/tags',function(req,res){
    Post.getTags(function(err,posts){
      if(err){
        req.flash('error',err);
        return res.redirect('/');
      }
      res.render('tags',{
        title:'标签',
        posts:posts,
        user:req.session.user,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
      })
    })
  });
  app.get('/tags/:tag',function(req,res){
    Post.getTag(req.params.tag,function(err,posts){
      if(err){
        req.flash('error',err);
        return res.redirect('/');
      }
      console.log(posts)
      res.render('tag',{
        title:'TAG:'+req.params.tag,
        posts:posts,
        user:req.session.user,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
      })
    })
  });
  app.get('/links',function(req,res){
    res.render('links',{
      title:'有情链接',
      user:req.session.user,
      success:req.flash('success').toString(),
      error:req.flash('error').toString()
    })
  });
  app.get('/search',function(req,res){
    Post.search(req.query.keyword,function(err,posts){
      if(err){
        req.flash('error',err);
        res.redirect('/');
      }
      res.render('search',{
        title:'SEARCH:'+req.query.keyword,
        posts:posts,
        user:req.session.user,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
      })
    });
  });
  app.get('/u/:name',function(req,res){
    var page=req.query.p?parseInt(req.query.p):1;
    //检查用户是否存在
    User.get(req.params.name,function(err,user){
      if(!user){
        req.flash('error','用户不存在');
        return res.redirect('/');
      }
      //查询并返回该用户的所有文章
      Post.getTen(user.name,page,function(err,posts,total){
        if(err){
          req.flash('error',err);
          return res.redirect('/');
        }
        res.render('user',{
          title:user.name,
          posts:posts,
          page:page,
          isFirstPage:(page-1)==0,
          isLastPage:((page-1)*10+posts.length)==total,
          user:req.session.user,
          success:req.flash('success').toString(),
          error:req.flash('error').toString()
        });
      });
    });
  });
  app.get('/u/:name/:day/:title',function(req,res){
    Post.getOne(req.params.name,req.params.day,req.params.title,function(err,post){
      if(err){
        req.flash('error',err);
        return res.redirect('/');
      }
      res.render('article',{
        title:req.params.title,
        post:post,
        user:req.session.user,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
      });
    });
    
  });
  app.post('/u/:name/:day/:title',function(req,res){
    var date=new Date(),
        time=date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+(date.getMinutes()<10?'0'+date.getMinutes():date.getMinutes()),
        head = "http://q4.qlogo.cn/g?b=qq&nk=" + req.body.email.toLowerCase() + "&s=1"; 
    var comment={
      name:req.body.name,
      head:head,
      email:req.body.email,
      website:req.body.website,
      time:time,
      content:req.body.content
    }
    var newComment=new Comment(req.params.name,req.params.day,req.params.title,comment);
    newComment.save(function(err){
      if(err){
        req.flash('error',err);
        return res.redirect('back');
      }
      req.flash('success','留言成功');
      res.redirect('back');
    });
  });
  app.get('/edit/:name/:day/:title',checkLogin);
  app.get('/edit/:name/:day/:title',function(req,res){
    var currentUser=req.session.user;
    Post.edit(currentUser.name,req.params.day,req.params.title,function(err,post){
      if(err){
        req.flash('error',err);
        return res.redirect('back');
      }
      res.render('edit',{
        title:'编辑',
        post:post,
        user:req.session.user,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
      });
    });
    
  });
  app.post('/edit/:name/:day/:title',checkLogin);
  app.post('/edit/:name/:day/:title',function(req,res){
    var currentUser=req.session.user;
    Post.update(currentUser.name,req.params.day,req.params.title,req.body.post,function(err){
      var url=encodeURI('/u/'+req.params.name+'/'+req.params.day+'/'+req.params.title);
      if(err){
        req.flash('error',err);
        return res.redirect(url);
      }
      req.flash('success','修改成功');
      res.redirect(url);
      
    });
  });
  app.get('/remove/:name/:day/:title',checkLogin);
  app.get('/remove/:name/:day/:title',function(req,res){
    var currentUser=req.session.user;
    Post.remove(currentUser.name,req.params.day,req.params.title,function(err,post){
      if(err){
        req.flash('error',err);
        return res.redirect('back');
      }
      req.flash('success','删除成功');
      res.redirect('/');
    });
    
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
  app.use(function(req,res){
    res.render("404");
  })
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

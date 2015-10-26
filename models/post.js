var mongodb = require('./db'),
    markdown=require('markdown').markdown;

function Post(name,title,post) {
  this.name = name;
  this.title = title;
  this.post = post;
}

module.exports = Post;

//储存文章
Post.prototype.save = function(callback) {
  var date=new Date();
  //储存各种时间格式
  var time={
    date:date,
    year:date.getFullYear(),
    month:date.getFullYear()+'-'+(date.getMonth()+1),
    day:date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate(),
    minute:date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+(date.getMinutes()<10?'0'+date.getMinutes():date.getMinutes())
  }
  //要存入数据库的用户文档
  var post = {
      name: this.name,
      time:time,
      title: this.title,
      post: this.post,
      comments:[]
  };
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);//错误，返回 err 信息
    }
    //读取 posts 集合
    db.collection('posts', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);//错误，返回 err 信息
      }
      //将用户数据插入 posts 集合
      collection.insert(post, {
        safe: true
      }, function (err) {
        mongodb.close();
        if (err) {
          return callback(err);//错误，返回 err 信息
        }
        callback(null);//成功！err 为 null
      });
    });
  });
};

//读取文章
Post.getTen = function(name,page, callback) {
    //打开数据库
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }
        //读取posts集合
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query={};
            if(name){
              query.name=name;
            }
            //使用 count 返回特定查询的文档数 total
            collection.count(query,function(err,total){
              //根据 query 对象查询文章并跳过前 (page-1)*10 个结果，返回之后的 10 个结果
              collection.find(query,{
                skip:(page-1)*10,
                limit:10
              }).sort({
                  time:-1
              }).toArray(function(err,docs){
                mongodb.close();
                if(err){
                  return callback(err);
                }
                //解析 markdown 为 html
                docs.forEach(function (doc) {
                  doc.post = markdown.toHTML(doc.post);
                });
                callback(null,docs,total);//成功！以数组形式返回查询的结果
              })

            })
        });
    });
}

//读取一篇文章
Post.getOne=function(name,day,title,callback){
  //打开数据库
  mongodb.open(function(err,db){
    if(err){
      callback(err);
    }
    //读取posts集合
    db.collection('posts',function(err,collection){
      if(err){
        mongodb.close();
        return callback(err);
      }
      //根据用户名、发表日期及文章标题进行查询
      collection.findOne({
        'name':name,
        'time.day':day,
        'title':title
      },function(err,doc){
        mongodb.close();
        if(err){
          return callback(err);
        }
        //解析markdown为html
        if(doc){
          doc.post=markdown.toHTML(doc.post);
          doc.comments.forEach(function(comment){
            comment.content=markdown.toHTML(comment.content);
          })
        }
        callback(null,doc);
      });
    });
  });
};
Post.edit=function(name,day,title,callback){
  //打开数据库
  mongodb.open(function(err,db){
    if(err){
      return callback(err);
    }
    //读取posts集合
    db.collection('posts',function(err,collection){
      if(err){
        mongodb.close();
        return callback(err);
      }
      //根据用户名，日期及文章名进行查询
      collection.findOne({
        "name":name,
        "time.day":day,
        "title":title
      },function(err,doc){
        mongodb.close();
        if(err){
          return callback(err);
        }
        callback(null,doc);
      })
    })
  })
}
Post.update=function(name,day,title,post,callback){
  //打开数据库
  mongodb.open(function(err,db){
    if(err){
      return callback(err);
    }
    //读取posts集合
    db.collection('posts',function(err,collection){
      if(err){
        mongodb.close();
        return callback(err);
      }
      //根据用户名，日期及文章名进行查询
      collection.update({
        "name":name,
        "time.day":day,
        "title":title
      },{
        $set:{post:post}
      },function(err,doc){
        mongodb.close();
        if(err){
          return callback(err);
        }
        callback(null);
      })
    })
  })
}
Post.remove=function(name,day,title,callback){
  //打开数据库
  mongodb.open(function(err,db){
    if(err){
      return callback(err);
    }
    //读取posts集合
    db.collection('posts',function(err,collection){
      if(err){
        mongodb.close();
        return callback(err);
      }
      //根据用户名，日期及文章名进行查询
      collection.remove({
        "name":name,
        "time.day":day,
        "title":title
      },{
        w:1
      },function(err,doc){
        mongodb.close();
        if(err){
          return callback(err);
        }
        callback(null);
      })
    })
  })
}

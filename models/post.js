var mongodb = require('./db'),
    markdown=require('markdown').markdown;

function Post(name,title,post) {
  this.name = name;
  this.title = title;
  this.post = post;
}

module.exports = Post;

//储存用户信息
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
      post: this.post
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

//读取用户信息
Post.get = function(name, callback) {
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
            //根据 query 对象查询文章
            collection.find(query).sort({
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
              callback(null,docs);//成功！以数组形式返回查询的结果
            })
        });
    });
}

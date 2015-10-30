var mongodb = require('./db');
var crypto = require('crypto');

function User(user) {
  this.name = user.name;
  this.password = user.password;
  this.email = user.email;
}

module.exports = User;

//储存用户信息
User.prototype.save = function(callback) {
  var head="http://q4.qlogo.cn/g?b=qq&nk="+this.email.toLowerCase()+'&s=1';
  //要存入数据库的用户文档
  var user = {
      name: this.name,
      password: this.password,
      email: this.email,
      head:head
  };
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);//错误，返回 err 信息
    }
    //读取 users 集合
    db.collection('users', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);//错误，返回 err 信息
      }
      //将用户数据插入 users 集合
      console.log(user)
      collection.insert(user, {
        safe: true
      }, function (err, user) {
        mongodb.close();
        if (err) {
          return callback(err);//错误，返回 err 信息
        }
        callback(null, user[0]);//成功！err 为 null，并返回存储后的用户文档
      });
    });
  });
};

//读取用户信息
User.get = function(name, callback) {
    //打开数据库
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }
        //读取users集合
        db.collection('users', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.findOne({
                name: name
            }, function(err, user) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, user); //返回查询的用户信息
            })
        });
    });
}

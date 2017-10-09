var mongodb = require('mongodb');
var server  = new mongodb.Server('localhost',27017,{});
var db      = new mongodb.Db('tpblog',server,{});

//连接db
db.open(function(err, db){
    if(!err){
        console.log('connect db');
        db.createCollection('userName', {}, function(err, collection){
            if(err){
                console.log(err);
            }else{

                var tmp1 = {title:'hello'};
                var tmp2 = {title:'world'};
                collection.insert([tmp1,tmp2],{safe:true},function(err,result){
                   console.log(result);
                });
                collection.find().toArray(function(err,docs){
                   console.log('find');
                   console.log(docs);
                });
                collection.findOne(function(err,doc){
                    console.log('findOne');
                    console.log(doc);
                });
            }

        });

    }else{
        console.log(err);
    }
});
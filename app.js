/**
 * Created by hanrea on 15-6-13.
 * hanrea@qq.com
 */
var app = require('koa')();
    router = require('koa-router'),
    staticServer = require('koa-static'),
    debug = require('debug')('koa');
var fs=require("fs");  
var path = require('path');
app.proxy = true;//设置为代理模式

//静态文件服务
app.use(staticServer(__dirname + '/static'));

var server = require('http').createServer(app.callback());
var opts = {path:"/socket",transports:[ 'websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling'],pingInterval:5000};
var io = require('socket.io')(server,opts);


var phones =[];//记录所有登录的手机号
var tables = {};//记录分数排行榜  key：phone   ，value = value
var scores = [];//记录分数
var  topScore  =0;//系统最高分

// //定义一个比较器 
// function compare() {
//     return function(object1, object2) {
//         var value1 = object1["score"];
//         var value2 = object2["score"];
//         if (value2 < value1) {
//             return - 1;
//         } else if (value2 > value1) {
//             return 1;
//         } else {
//             return 0;
//         }
//     };
// }
// //使用方法 
// // data.sort(compare("age"));　　alert(data[0].age); //25s 
function convertPhone(phone){
  return phone.substr(0,3)+"****"+phone.substr(7); 
}

function readConf(){
    fs.readFile("conf.json",'utf-8',function(err,data){  
        if(err){  
            console.log("error");  
        }else{  
            console.log(data);  
            var conf = JSON.parse(data); 
            phones =conf["phones"];
            tables =conf["tables"];
            scores =conf["scores"];
            topScore =conf["topScore"];
        }  
    });  
};
function writeConf(){
    var  conf = {};
    conf["phones"] = phones;
    conf["tables"] = tables;
    conf["scores"] = scores;
    conf["topScore"] = topScore;
    fs.writeFile(path.join(__dirname, 'conf.json'), JSON.stringify(conf), function (err) {
        if (err) throw err;
    });
};

//重启使用历史数据
readConf();
//定时保存数据
// setInterval(writeConf,1000*60);

io.on('connection',function(socket) {
//     console.log("socket  login");
// console.log(socket);
    socket.on('login',function(phone) {
        console.log(phone);
        if(phones.indexOf(phone)==-1){
          phones.push(phone);
        }
        var myScore=tables[phone] ||0
        var info = {"topScore":topScore,"myScore":myScore };

        socket.emit('init', info);//发送排名信息

        socket.broadcast.emit('join', convertPhone(phone));

    });

    


    socket.on('push',function(data) {
        if(phones.indexOf(data["phone"])==-1){
          phones.push(data["phone"]);
        }
        var tmpscore = tables[data["phone"]] ;
        var topscore = tmpscore;
        
        if (tmpscore !=undefined) {
            scores.push(data["score"]);
            if (tmpscore<data["score"]) {
              topscore =tables[data["phone"]] = data["score"];
            }
        }else{
            tables[data["phone"]] = data["score"];
            scores.push(data["score"]);
        };
        scores.sort(function (a,b){return b - a ;});
        topScore = scores[0];
        var curIndex= scores.indexOf(data["score"])+1;
        var topIndex = scores.indexOf(topscore)+1;
        if(tmpscore !=undefined){
          if (tmpscore<data["score"]) {
            scores.splice(scores.indexOf(tmpscore),1);
            tmpscore = data["score"];
          }else{
            scores.splice(scores.indexOf(data["score"]),1);
          }
          console.log(scores);
        }
        data["curIndex"] =curIndex ;
        data["topIndex"] =topIndex < curIndex ? topIndex: curIndex   ;
        socket.emit('rank', data);//发送排名信息
        data["phone"] = convertPhone(data["phone"])
        delete data["curIndex"];
        delete data["topIndex"];
        socket.broadcast.emit('push', data);

        writeConf();
    });
    //离开游戏

});

server.listen(7777);
console.log("server is start on 7777");



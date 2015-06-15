/**
 * Created by hanrea on 15-6-13.
 * hanrea@qq.com
 */


var app = require('koa')();
    router = require('koa-router'),
    staticServer = require('koa-static'),
    debug = require('debug')('koa');

app.proxy = true;//设置为代理模式


//静态文件服务
app.use(staticServer(__dirname + '/static'));


var server = require('http').createServer(app.callback());
var opts = {path:"/socket"};
var io = require('socket.io')(server,opts);

io.on('connection', function(socket){

  console.log("socket  login");
   socket.on('username', function (data) {
    console.log(data);
      socket.emit('moving', data);
    // This line sends the event (broadcasts it)
    // to everyone except the originating client.
    socket.broadcast.emit('moving', data);
  });
  
});
server.listen(8888);





// var user = {};//客户端
// var rank = {};//排行

// debug('stat..........');
// app.proxy = true;//设置为代理模式

// app.on('error', function*(err, ctx){
//     console.error('server error'+err);
// });

// 使用路由
// app.use(router(app));

// app.get('/', function *(next) {
//   return this.body = "";
// });

// // 这一行代码一定要在最后一个app.use后面使用
// var server = require('http').Server(app.callback()),
//     io = require('socket.io')(server);

//   //设置客户端应该在多少时间内接收到一个心跳信号
//   io.set('heartbeat timeout',20);
//   //设置服务器端每隔多上时间应该发一个心跳信号
//   io.set('heartbeat interval',10);

//   io.set('transports', ['websocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']);

//   //io.set('polling duration',10);
// // Socket.io的标准用法
// io.sockets.on('connection', function (socket) {
	
// });




console.log("server is start");



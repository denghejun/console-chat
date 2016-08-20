const cp = require('child_process');
const net = require('net');
var hashMap = require('hashmap').HashMap;
const leftPad = require('left-pad');
const context = new (require("./core/server-context"))();
const server = net.createServer();
const SERVER_PORT = 8080;
const child_process = cp.fork(`${__dirname}/core/child_process`,{stdio:'inherit'});
process.on('uncaughtException',err => {
  console.error(err.stack);
});

server.on('connection',socket => {
   context.add_client(socket);
   socket.on('connect',()=>{
      child_process.send({type:'client_connect'}, socket,{keepOpen:true});
   });
  
   socket.on('data', data => {
       context.send_each_clients(data);
   });

   socket.on('end',() => {
       context.remove_client(socket);
       child_process.send({type:'client_disconnect',socket:`${socket.remoteAddress}:${socket.remotePort}`});
   });

   socket.on('error',err => {
       context.remove_client(socket);
        child_process.send({type:'client_disconnect',socket:`${socket.remoteAddress}:${socket.remotePort}`});
    });
});

server.on('error',err => {
    process.stdout.write(err.message);
});

child_process.on('message',(message,handle)=>{
   switch(message.type)
    {
        case 'client_connect':
            context.add_client(handle);
        break;

        case 'client_disconnect':
            context.remove_client_byKey(message.socket);
        break;     

        default:
        break;   
    }
});

child_process.on('error',err => {
    console.log(err.message);
});

server.listen(SERVER_PORT,() => {
   child_process.send({type:'start'}, server);
   console.log('server is running on %j', server.address());
});

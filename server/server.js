const cp = require('child_process');
const net = require('net');
var hashMap = require('hashmap').HashMap;

const server = net.createServer();
const SERVER_PORT = 8080;
const child_process = cp.fork(`${__dirname}/core/child_process`);
var clients = new hashMap();

server.on('connection',socket => {
   if(!clients.has(`${socket.remoteAddress}:${socket.remotePort}`))
   {
     clients.set(`${socket.remoteAddress}:${socket.remotePort}`,socket);       
   }

   socket.on('data',data => {
       clients.forEach((clientSocket,address) => {
            // clientSocket.write(`${clients.search(socket)} said: ${data}\r\n`)
            clientSocket.write(data);
       });
   });

   socket.on('end',() => {
       clients.remove(clients.search(socket));
   });

   socket.on('error',err => {
       clients.remove(clients.search(socket));
    });
});

server.on('error',err => {
    process.stdout.write(err);
});

server.listen(SERVER_PORT,() => {
   // child_process.send('server',server);
     address = server.address();
  console.log('server is running on %j', address);
});

const net = require('net');
const SERVER_PORT = 8080;
const SERVER_HOST = 'localhost';
var lineNumber = 0;


const client = net.createConnection(SERVER_PORT,SERVER_HOST);
client.on('connect',() => {
    process.stdout.write('connect server successfully, you can chat NOW!\n');
});

client.on('data',data => {
    process.stdout.write(data);
});   

client.on('error',err => {
  switch(err.code)
  {
    case 'ECONNRESET':
      process.stdout.write('the chat server is resetting, please try later.\n');
      break;
    case 'ECONNREFUSED':
      process.stdout.write('the chat server was down, please try later.\n');
    default:break;
  }
});

process.stdin.setEncoding('utf8');
process.stdin.on('readable', () => {
  var chunk = process.stdin.read();
  if (chunk !== null&&chunk!=='\n'&&chunk!=='\r\n') {
    if(client.destroyed)
    {
      client.connect({port:SERVER_PORT, host:SERVER_HOST});
    }

    client.write(`${chunk}`);
    process.stdout.moveCursor(0,-1); 
     process.stdout.clearLine();
    process.stdout.cursorTo(0);  
//     setTimeout(function () {   
//     process.stdout.clearLine();
//     process.stdout.cursorTo(0);         
// }, 200);
  }
});





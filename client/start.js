const net = require('net');
const fs = require('fs');
const SERVER_PORT = 8080;
const SERVER_HOST = 'localhost';
var lineNumber = 0;


const client = net.createConnection(SERVER_PORT,SERVER_HOST).setNoDelay(true);
client.on('connect',() => {
    process.stdout.write('connect server successfully, you can chat NOW!\n');
});

var buffer = new Buffer(0);
var chunks = [];
var count =0;
client.on('data',data => {
  const dataBuffer =Buffer.from(data.buffer);
  if(dataBuffer.slice(dataBuffer.length-4,dataBuffer.length).equals(Buffer.from('!EOF')))
  {
    chunks.push(dataBuffer.slice(0,dataBuffer.length-4));
    var stream1 = fs.createWriteStream('1.png');
        stream1.write(new Buffer(Buffer.concat(chunks)));
        stream1.end();
        chunks=[];
  }
  else if(dataBuffer.slice(dataBuffer.length-4,dataBuffer.length).equals(Buffer.from('!EOS')))
  {
    chunks.push(dataBuffer.slice(0,dataBuffer.length-4));
    process.stdout.write(Buffer.concat(chunks));
    chunks=[];
  }
  else
  {
    chunks.push(data);
  }
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
    if (chunk !== null&&chunk!=='\n'&&chunk!=='\r\n') 
    {
      chunk = chunk.toString().replace('\r\n','');
      if(client.destroyed)
      {
        client.connect({port:SERVER_PORT, host:SERVER_HOST});
      }

      fs.exists(`${chunk}`, (exists) => {
        if(exists)
        {
              fs.readFile(chunk, (err, data) => {
                  if (err) throw err;
                  const dataBuffer = Buffer.from(data.buffer);
                  const eofBuffer = Buffer.from('!EOF');
                  client.write(Buffer.concat([dataBuffer,eofBuffer]));
               });
        }
        else
        {
          var textData = 
          {
            
          };
            client.write(chunk+'\r\n!EOS');
        }
    });

    process.stdout.moveCursor(0,-1); 
    process.stdout.clearLine();
    process.stdout.cursorTo(0);  
  }
});





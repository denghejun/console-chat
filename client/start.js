const net = require('net');
const fs = require('fs');
const leftPad = require('left-pad');
const SERVER_PORT = 8080;
const SERVER_HOST = 'localhost';
var chunks;
var bfType,bfLength;

const client = net.createConnection(SERVER_PORT,SERVER_HOST).setNoDelay(true);
client.on('connect',() => {
    process.stdout.write('connect server successfully, you can chat NOW!\n');
});


client.on('data',data => {
  const dataBuffer =Buffer.from(data.buffer);
  chunks =chunks ? Buffer.concat([chunks, dataBuffer]) : dataBuffer;
  if(!bfType && !bfLength)
  {
     bfType = dataBuffer.slice(0,6).toString().trim(); // 6 bytes for 'type'
     bfLength = dataBuffer.slice(6,10).readUInt32BE(); // 4 bytes for 'data length'
  }

  if(chunks.length == bfLength + 6 + 4)
  {
    const bfInnerData = chunks.slice(10, chunks.length);
   switch(bfType)
   {
     case 'text':
        process.stdout.write(bfInnerData);
        break;

     case 'image':
        var stream1 = fs.createWriteStream('1.png');
        stream1.write(bfInnerData);
        stream1.end();
        break;

     default:
        process.stdout.write('unknow message type.\r\n');
        break;
   }

   chunks = undefined;
   bfType = undefined;
   bfLength = undefined;
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

                  const bfType = Buffer.alloc(6,leftPad('image',6,''));
                  const bfValue = Buffer.from(data.buffer);
                  const bfLength = Buffer.alloc(4,0);
                  bfLength.writeUInt32BE(bfValue.length);
                  client.write(Buffer.concat([bfType,bfLength,bfValue]));
               });
        }
        else
        {
            const bfType = Buffer.alloc(6,leftPad('text',6,''));
            const bfValue = Buffer.from(chunk+'\r\n');
            const bfLength = Buffer.alloc(4,0);
            bfLength.writeUInt32BE(bfValue.length);
            client.write(Buffer.concat([bfType,bfLength,bfValue]));
        }
    });

    process.stdout.moveCursor(0,-1); 
    process.stdout.clearLine();
    process.stdout.cursorTo(0);  
  }
});





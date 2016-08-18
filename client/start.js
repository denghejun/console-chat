const net = require('net');
const fs = require('fs');
const leftPad = require('left-pad');
const colors = require('colors');
var imaging = require('imaging');
const SERVER_PORT = 8080;
const SERVER_HOST = 'localhost';
let chunks;
let bfType;
let bfLength;
let sender;

const client = net.createConnection(SERVER_PORT,SERVER_HOST).setNoDelay(true);
client.on('connect',() => {
    process.stdout.write('connect server successfully, you can chat NOW!\n'.green);
});

client.on('data',data => {
  const dataBuffer =Buffer.from(data.buffer);
  chunks =chunks ? Buffer.concat([chunks, dataBuffer]) : dataBuffer;
  if(!bfType && !bfLength && !sender)
  {
     sender = dataBuffer.slice(0,30).toString().trim(); // 30 bytes for 'sender'
     bfType = dataBuffer.slice(30,36).toString().trim(); // 6 bytes for 'type'
     bfLength = dataBuffer.slice(36,40).readUInt32BE(); // 4 bytes for 'data length'
  }

  if(chunks.length == bfLength + 30 + 6 + 4)
  {
   const bfInnerData = chunks.slice(40, chunks.length);
   const bfSenderPrefix = Buffer.from('@'+sender + ' said>>');
   const bfEnding = Buffer.from('\r\n');
   switch(bfType)
   {
     case 'text':
        process.stdout.write(bfSenderPrefix.toString().red);
        process.stdout.write(Buffer.concat([bfInnerData,bfEnding]));
        break;

     case 'image':
        if (!fs.existsSync('temp')){
          fs.mkdirSync('temp');
        }

        process.stdout.write(bfSenderPrefix.toString().rainbow);
        let imageStream = fs.createWriteStream('temp/any');
        imageStream.write(bfInnerData);
        imageStream.end();
        setTimeout(function() {
           imaging.draw('temp/any', { width:process.stdout.rows,char:'★' }, function (resp, status) {
             process.stdout.write(resp);
            });
        }, 100);

        process.stdout.write(Buffer.concat([bfEnding]));
        break;

     default:
        process.stdout.write('unknow message type.\r\n');
        break;
   }

   chunks = undefined;
   bfType = undefined;
   bfLength = undefined;
   sender = undefined;
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
    let chunk = process.stdin.read();
    if (chunk !== null&&chunk!=='\n'&&chunk!=='\r\n') 
    {
      chunk = chunk.toString().replace(/\r\n/g,'').replace(/"/g,'');
      if(client.destroyed)
      {
        client.connect({port:SERVER_PORT, host:SERVER_HOST});
      }

      fs.exists(chunk, (exists) => {
        const sender = Buffer.alloc(30, leftPad(client.address()['address'] + ':' +client.address()['port'].toString(),30,''));
        if(exists)
        {
              fs.readFile(chunk, (err, data) => {
                  if (err) throw err;

                  const bfType = Buffer.alloc(6,leftPad('image',6,''));
                  const bfValue = Buffer.from(data.buffer);
                  const bfLength = Buffer.alloc(4,0);
                  bfLength.writeUInt32BE(bfValue.length);
                  client.write(Buffer.concat([sender,bfType,bfLength,bfValue]));
               });
        }
        else
        {
            const bfType = Buffer.alloc(6,leftPad('text',6,''));
            const bfValue = Buffer.from(chunk);
            const bfLength = Buffer.alloc(4,0);
            bfLength.writeUInt32BE(bfValue.length);
            client.write(Buffer.concat([sender,bfType,bfLength,bfValue]));
        }
    });

    process.stdout.moveCursor(0,-1); 
    process.stdout.clearLine();
    process.stdout.cursorTo(0);  
  }
});






const cp = require('./client-processor');
const mp = require('./message-processor');
let client;

module.exports.start = (server_port,server_host) => {
    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', () => {
        let chunk = process.stdin.read();
        if(!client)
        {
        client = cp.processor.New(server_port,server_host,mp.processor.clientCreatedSuccess,mp.processor.clientError,mp.processor.receive);
        }
        else if(client.destroyed)
        {
        client =  cp.processor.New(server_port,server_host,()=>{   
            mp.processor.send(client,chunk);
        },mp.processor.clientError,mp.processor.receive);
        }
        else
        {
            mp.processor.send(client,chunk);
        }
    });
}


const net = require('net');
exports.processor = {
    New:(port,host,createdCallback,errorCallback,receiveMessageCallback)=>{
            const client = net.createConnection(port,host).setNoDelay(true);
            client.on('connect',createdCallback);
            client.on('error',errorCallback);
            client.on('data',data => {
                receiveMessageCallback(client,data);
            });
            
            return client;
        }
};
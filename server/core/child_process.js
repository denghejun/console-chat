const context = new (require("./server-context"))();
process.on('uncaughtException',err => {
  console.error(err.stack);
});
process.on('message',(message,handle) => {
    switch(message.type)
    {
        case 'start':
            handle.on('connection', socket => {
                context.add_client(socket);
                socket.on('data', data => {
                    console.log('image');
                    context.send_each_clients(data);
                });

                socket.on('end',() => {
                    context.remove_client(socket);
                    process.send({type:'client_disconnect',socket:`${socket.remoteAddress}:${socket.remotePort}`});
                });

                socket.on('error',err => {
                    context.remove_client(socket);
                    process.send({type:'client_disconnect',socket:`${socket.remoteAddress}:${socket.remotePort}`});
                    });

                process.send({type:'client_connect'}, socket,{keepOpen:true});
                });
        
            handle.on('error', err => {
                process.stdout.write(err.message);
            });

        break;

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
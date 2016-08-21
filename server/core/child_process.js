const context = new (require("./server-context"))();
process.on('uncaughtException',err => {
  console.error(err.stack);
});
process.on('message',(message,handle) => {
    switch(message.type)
    {
        case 'MSG_CONN':
                context.add_client(handle);
                handle.on('data', data => {
                    context.send_each_clients(data);
                });

                handle.on('end',() => {
                    context.remove_client(handle);
                });

                handle.on('error',err => {
                    context.remove_client(handle);
                    });
                    
        break;
        
        default:
        break;   
    }
});
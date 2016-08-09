process.on('message',(mes,server) => {
    if(mes === 'server')
    {
        server.on('connection', socket => {
           socket.on('data',data => {
           socket.end(`server received msg: ${data} from ${socket.remoteAddress}`)
            });
        });
    }
});
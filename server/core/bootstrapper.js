const cp = require('child_process');
const net = require('net');
module.exports.start = server_port => {
    const server = net.createServer();
    const child_process = cp.fork(`${__dirname}/child_process`,{stdio:'inherit'});
    process.on('uncaughtException',err => {
    console.error(err.stack);
    });

    server.on('connection',socket => {
    child_process.send({type:'MSG_CONN'}, socket);
    });

    server.on('error',err => {
        process.stdout.write(err.message);
    });

    child_process.on('error',err => {
        console.log(err.message);
    });

    server.listen(server_port,() => {
    console.log('server is running on %j', server.address());
    });
}; 


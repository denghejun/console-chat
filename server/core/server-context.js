var hashMap = require('hashmap').HashMap;
module.exports = class ServerContext
{
    constructor()
    {
        this._clients = new hashMap();
    }

    get clients()
    {
        return this._clients;
    }
    
    set clients(value)
    {
        this._clients = value;
    }

    add_client(socket)
    {
        if(socket && !this.clients.has(`${socket.remoteAddress}:${socket.remotePort}`))
        {
          this.clients.set(`${socket.remoteAddress}:${socket.remotePort}`,socket);       
        }
    }

    remove_client(socket)
    {
        if(socket && this.clients.has(`${socket.remoteAddress}:${socket.remotePort}`))
        {
          this.clients.remove(this.clients.search(socket));
        }
    }

    remove_client_byKey(key)
    {
        this.clients.remove(key);
    }

    send_each_clients(data)
    {
         this.clients.forEach((clientSocket,address) => {
           clientSocket.write(data);
       });
    }
}
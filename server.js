'use strict';

var http = require('http'),
    url = require('url'),

    route = require('./routes').route,

    GLOBAL_CFG = require('./config.json'),

    portListen, body, server;



// Starting here

// Checking for passed arguments
if (process.argv.length < 3) {
    portListen = GLOBAL_CFG.server.port;
} else {
    portListen = process.argv[2];
}

// HTTP server setup
server = http.createServer(function (request, response) {
    // extract ip and remove ipv6 address
    var ip = request.connection.remoteAddress;

    if (ip.indexOf(':') === 0) {
        ip = request.connection.remoteAddress.split(':')[3];
    }

    request.on('data', function (chunk) {
        body += chunk;
    });

    request.on('end', function () {
        // extract path and method from URL
        var clientReq = url.parse(request.url),
            path = clientReq.pathname;
        //console.log("-> "+path);

        response.writeHead(200, {'Content-Type': 'application/json'});

        // Using the main controler to route the requests
        route(path, response, ip);

    });
});


// Starting the server
server.listen(portListen);
console.log('Server is listening in http://localhost:' + portListen + ' with PID ' + process.pid);

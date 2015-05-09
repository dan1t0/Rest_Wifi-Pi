'use strict';

var http = require('http');
var url = require('url');

var getStatus = require('./getStatus');
var clients = require('./clients');
var helpers = require('./helpers');

var PKG_INFO = require('./package.json');
var GLOBAL_CFG = require('./config');

var portListen;
var body;


// Starting here
if (process.argv.length < 3) {
    portListen = GLOBAL_CFG.server.port;
} else {
    portListen = process.argv[2];
}


var server = http.createServer(function (request, response) {
    //extract ip and remove ipv6 address
    var ip = request.connection.remoteAddress;
    if (ip.indexOf(':') === 0 ) {
        ip = request.connection.remoteAddress.split(':')[3];
    }


    request.on('data', function(chunk) {
        body += chunk;
    });

    request.on('end', function() {
        response.writeHead(200, {'Content-Type': 'application/json'});

        //extract path and method from URL
        var clientReq = url.parse(request.url);
        var path = clientReq.pathname;
        //console.log("-> "+path);

        //console.log("path: "+path);
        var paths = path.split('/');
        //console.log("ruta: "+paths[1]);


        if (paths[1] === 'api') {
            // resonse status
            if (paths[2] === 'version') {
               response.writeHead(200, {'Content-Type': 'application/json'});
               response.write(JSON.stringify({ version: PKG_INFO.version }, null, 2));
               response.end();
               console.log(ip + ' - Response with the API version: ' + PKG_INFO.version);
            } else if (paths[2] === 'stats') {
                switch (paths[3]) {
                   case 'dns':
                   {
                       getStatus.dnsStat(function(err, rsp){
                           helpers.makeResponse(err, rsp, response, ip, 'dns stats');
                       });
                       break;
                   }

                   case 'dhcp':
                   {
                       getStatus.dhcpStat(function(err, rsp){
                           helpers.makeResponse(err, rsp, response, ip, 'dhcp stats');
                       });
                       break;
                   }

                   case 'ipforward':
                   {
                       getStatus.ipfowardStat(function(err, rsp){
                           helpers.makeResponse(err, rsp, response, ip, 'ipforward stats');
                       });
                       break;
                   }

                   case 'hostapd':
                   {
                       getStatus.hostapdStat(function(err, rsp){
                           helpers.makeResponse(err, rsp, response, ip, 'hostapd stats');
                       });
                       break;
                   }

                   case 'iptables':
                   {
                       getStatus.iptablesStat(function(err, rsp){
                           helpers.makeResponse(err, rsp, response, ip, 'iptables stats');
                       });
                       break;
                   }

                   case 'wlan':
                   {
                      getStatus.wlanStat(function(err, rsp){
                          helpers.makeResponse(err, rsp, response, ip, 'wlan stats');
                      });
                      break;
                   }

                   case 'all':
                   {
                       getStatus.allStatus(function(err, rsp){
                           helpers.makeResponse(err, rsp, response, ip, 'all stats');
                       });
                       break;
                   }

                   case 'hoststatus':
                   {
                       getStatus.getHostStatus(function(err, rsp){
                           helpers.makeResponse(err, rsp, response, ip, 'hoststatus stats');
                       });
                       break;
                   }

                   default:
                   {
                       helpers.m404(response,ip,path);
                   }
               }
            } else if (paths[2] === 'list') {
                switch (paths[3]) {
                    case 'clients':
                    {
                        //interface_id in input
                        clients.getClients(GLOBAL_CFG.ifaces.ap,function(err, rsp){
                            helpers.makeResponse(err, rsp, response, ip, 'client list');
                        });
                        break;
                    }

                    case 'aps':
                    {
                        //interface_id in input
                        clients.getAps(GLOBAL_CFG.ifaces.scan,function(err, rsp){
                            helpers.makeResponse(err, rsp, response, ip, 'aps list');
                        });
                        break;
                    }

                    default:
                    {
                        helpers.m404(response,ip,path);
                    }
                }
            } else if (paths[2] === 'help') {
                helpers.help(response,ip);

            } else {
                helpers.m404(response,ip,path);
            }
       }  else {
           helpers.m404(response,ip,path);
       }
    });
});

// Starting the server
server.listen(portListen);
console.log( 'Server is listening in http://localhost:' +
            portListen + ' with PID ' + process.pid);

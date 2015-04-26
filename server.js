var http = require('http');
var url = require('url');

var getStatus = require('./getStatus');
var clients = require('./clients');

var portlisten = 0;

if (process.argv.length < 3) {
    portlisten = 8080;
} else {
    portlisten = process.argv[2];
}


//var stat = clients.getClients();


var server = http.createServer(function (request, response) {

    //extract ip and remove ipv6 address
    var ip = request.connection.remoteAddress;
    if (ip.indexOf(":") === 0 ) {
        ip = request.connection.remoteAddress.split(":")[3];
    }

    request.on('data', function (chunk) {
        body += chunk;
    })

    request.on('end', function () {
        response.writeHead(200, {"Content-Type": "application/json"});

        //extract path, method and query from URL
        var clientReq = url.parse(request.url);
        var path = clientReq.pathname;
        if (clientReq.query != null) {
            var query = clientReq.query.split("=")[1];
            var method = clientReq.query.split("=")[0];
        } else {
            var query = "null";
            var method = "null";
        }


         /*//Only for debug request
         console.log("-> path: "   + path);
         console.log("-> method: " + method);
         console.log("-> query: "  + query);
         */

        if (path == "/api") {
            // resonse status
            if (method === "stats") {
                switch (query) {
                   case 'dns':
                   {
                       response.writeHead(200, {"Content-Type": "application/json"});
                       getStatus.dnsStat(function(err, rsp){
                           //response.end(JSON.stringify(rsp, null, 2));
                           response.write(JSON.stringify(rsp, null, 2));
                           response.end();
                           console.log(ip+' Response with dns stats: '+rsp.dns);
                       });
                       break;
                   }

                   case 'dhcp':
                   {
                       response.writeHead(200, {"Content-Type": "application/json"});
                       getStatus.dhcpStat(function(err, rsp){
                           //response.end(JSON.stringify(rsp, null, 2));
                           response.write(JSON.stringify(rsp, null, 2));
                           response.end();
                           console.log(ip+' Response with dhcp stats: '+rsp.dhcp);
                       });
                       break;
                   }

                   case 'ipforward':
                   {
                       response.writeHead(200, {"Content-Type": "application/json"});
                       getStatus.ipfowardStat(function(err, rsp){
                           response.write(JSON.stringify(rsp, null, 2));
                           response.end()
                           console.log(ip+' Response with ipforward stats: '+rsp.ipfwd);
                       });
                       break;
                   }

                   case 'hostadp':
                   {
                       response.writeHead(200, {"Content-Type": "application/json"});
                       getStatus.hostapdStat(function(err, rsp){
                           response.write(JSON.stringify(rsp, null, 2));
                           response.end();
                           console.log(ip+' Response with hostapd stats: '+rsp.hostapd);
                       });
                       break;
                   }

                   case 'iptables': //iptablesStat
                   {
                       response.writeHead(200, {"Content-Type": "application/json"});
                       getStatus.iptablesStat(function(err, rsp){
                           response.write(JSON.stringify(rsp, null, 2));
                           response.end()
                           console.log(ip+' Response with iptables stats: '+rsp.iptables);
                       });
                       break;
                   }

                   case 'wlan':
                   {
                      response.writeHead(200, {"Content-Type": "application/json"});
                      getStatus.wlanStat(function(err, rsp){
                          response.write(JSON.stringify(rsp, null, 2));
                          response.end();
                          console.log(ip+' Response with wlan stats: '+rsp.wlan);
                      });
                      break;
                   }

                   case 'all':
                   {
                       response.writeHead(200, {"Content-Type": "application/json"});
                       getStatus.allStatus(function(err, rsp){
                           response.write(JSON.stringify(rsp, null, 2));
                           response.end();
                           console.log(ip+' Response with all status');
                       });
                       break;
                   }

                   default:
                   {
                       response.writeHead(404, {"Content-Type": "application/json"});
                       response.end();
                       console.log(ip+' stats='+query+' not found');
                   }
               }
            }
            if (method === "list") {
                switch (query) {
                    case 'clients':
                    {
                        response.writeHead(200, {"Content-Type": "application/json"});
                        clients.getClients(function(err, rsp){
                            response.write(JSON.stringify(rsp, null, 2));
                            response.end();
                            console.log(ip+' Response with client list');
                        });
                        break;;
                    }
                    default:
                    {
                        response.writeHead(404, {"Content-Type": "application/json"});
                        response.end();
                        console.log(ip+' method- '+query+' not found');
                    }
                }
            }
       }
    });
});
server.listen(portlisten);

console.log("Server is listening in http://localhost:"+
    portlisten+ " with PID "+ process.pid);

/*
   /api?stats=
      dns         -> {"dns":"up"}
      dhcp        -> {"dhcp":"up"}
      ipforward   -> {"ip-forward":"up"}
      hostadp     -> {"hostadp":"up"}
      ipTables    -> {"ipTables":"up"}
      wlan        -> {"wlan":"up"}
      all         -> {"dns":"up","dhcp":"up","ip-forward":"up",
                        "hostadp":"up","ipTables":"up","wlan":"up"}

*/

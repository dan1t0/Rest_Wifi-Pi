var http = require('http');
var url = require('url');

var getStatus = require('./getStatus');
var clients = require('./clients');

var PKG_INFO = require('./package.json');


var wlan = "wlan4"; //id wifi interface

var portlisten = 0;

if (process.argv.length < 3) {
    portlisten = 8080;
} else {
    portlisten = process.argv[2];
}



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

        //extract path and method from URL
        var clientReq = url.parse(request.url);
        var path = clientReq.pathname;
        //console.log("-> "+path);

        //console.log("path: "+path);
        var paths = path.split("/");
        //console.log("ruta: "+paths[1]);


        if (paths[1] == "api") {
            // resonse status
            if (paths[2] === "version") {
               response.writeHead(200, {"Content-Type": "application/json"});
               response.write(JSON.stringify({ version: PKG_INFO.version }, null, 2));
               response.end();
               console.log(ip+' - Response with the API version: '+PKG_INFO.version);
            } else if (paths[2] === "stats") {
                switch (paths[3]) {
                   case 'dns':
                   {
                       response.writeHead(200, {"Content-Type": "application/json"});
                       getStatus.dnsStat(function(err, rsp){
                           response.write(JSON.stringify(rsp, null, 2));
                           response.end();
                           console.log(ip+' - Response with dns stats: '+rsp.dns);
                       });
                       break;
                   }

                   case 'dhcp':
                   {
                       response.writeHead(200, {"Content-Type": "application/json"});
                       getStatus.dhcpStat(function(err, rsp){
                           response.write(JSON.stringify(rsp, null, 2));
                           response.end();
                           console.log(ip+' - Response with dhcp stats: '+rsp.dhcp);
                       });
                       break;
                   }

                   case 'ipforward':
                   {
                       response.writeHead(200, {"Content-Type": "application/json"});
                       getStatus.ipfowardStat(function(err, rsp){
                           response.write(JSON.stringify(rsp, null, 2));
                           response.end()
                           console.log(ip+' - Response with ipforward stats: '+rsp.ipfwd);
                       });
                       break;
                   }

                   case 'hostadp':
                   {
                       response.writeHead(200, {"Content-Type": "application/json"});
                       getStatus.hostapdStat(function(err, rsp){
                           response.write(JSON.stringify(rsp, null, 2));
                           response.end();
                           console.log(ip+' - Response with hostapd stats: '+rsp.hostapd);
                       });
                       break;
                   }

                   case 'iptables':
                   {
                       response.writeHead(200, {"Content-Type": "application/json"});
                       getStatus.iptablesStat(function(err, rsp){
                           response.write(JSON.stringify(rsp, null, 2));
                           response.end()
                           console.log(ip+' - Response with iptables stats: '+rsp.iptables);
                       });
                       break;
                   }

                   case 'wlan':
                   {
                      response.writeHead(200, {"Content-Type": "application/json"});
                      getStatus.wlanStat(function(err, rsp){
                          response.write(JSON.stringify(rsp, null, 2));
                          response.end();
                          console.log(ip+' - Response with wlan stats: '+rsp.wlan);
                      });
                      break;
                   }

                   case 'all':
                   {
                       response.writeHead(200, {"Content-Type": "application/json"});
                       getStatus.allStatus(function(err, rsp){
                           response.write(JSON.stringify(rsp, null, 2));
                           response.end();
                           console.log(ip+' - Response with all status');
                       });
                       break;
                   }

                   case 'hostStatus':
                   {
                       response.writeHead(200, {"Content-Type": "application/json"});
                       getStatus.getHostStatus(function(err, rsp){
                           response.write(JSON.stringify(rsp, null, 2));
                           response.end();
                           console.log(ip+' - Response with host status');
                       });
                       break;
                   }

                   default:
                   {
                       m404(response,ip,path);
                   }
               }
            } else if (paths[2] === "list") {
                switch (paths[3]) {
                    case 'clients':
                    {
                        response.writeHead(200, {"Content-Type": "application/json"});
                        //interface_id in input
                        clients.getClients("eth0",function(err, rsp){
                            response.write(JSON.stringify(rsp, null, 2));
                            response.end();

                            console.log(ip+' - Response with client list');
                        });
                        break;;
                    }

                    case 'aps':
                    {
                        response.writeHead(200, {"Content-Type": "application/json"});
                        //interface_id in input
                        clients.getAps(wlan,function(err, rsp){
                            response.write(JSON.stringify(rsp, null, 2));
                            response.end();

                            console.log(ip+' - Response with AP list');
                        });
                        break;;
                    }

                    default:
                    {
                        m404(response,ip,path);
                    }
                }
            } else {
                m404(response,ip,path);
            }
       }  else {
           m404(response,ip,path);
       }
    });
});
server.listen(portlisten);

console.log("Server is listening in http://localhost:"+
    portlisten+ " with PID "+ process.pid);



function m404 (response,ip,path){
    response.writeHead(404, {"Content-Type": "application/json"});
    response.end();
    console.log(ip+" - "+path+" 404 Not Found");
}
/*
   /api/stats/
      dns         -> {"dns":"up"}
      dhcp        -> {"dhcp":"up"}
      ipforward   -> {"ip-forward":"up"}
      hostadp     -> {"hostadp":"up"}
      ipTables    -> {"ipTables":"up"}
      wlan        -> {"wlan":"up"}
      all         -> {"dns":"up","dhcp":"up","ip-forward":"up",
                        "hostadp":"up","ipTables":"up","wlan":"up"
      }
      hoststatus  -> {
                      "hostname": XXX,
                      "uptime": "27 days 4 hours 39 mins",
                      "kernel": "3.18.8+",
                      "ram": { Ram and swap info },
                      "net": [{ info about networks interfaces }, ...],
                      "temp": 52.45,
                      "disk": { disk info }                  
      }

   /api/list/
      clients     -> {
                        "ip": ip,
                        "mac": "00:00:00:00:00:00",
                        "vendor": Product,
                        "online": false
                    }

*/

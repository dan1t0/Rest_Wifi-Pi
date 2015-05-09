'use strict';


// Helpers
function makeResponse(err, res, resObj, ipadd, description) {
    resObj.writeHead(200, {
        'Content-Type': 'application/json'
    });
    resObj.write(JSON.stringify(err || res, null, 2));
    resObj.end();
    console.log(ipadd + ' - Response with ' + description);
    
    // print all the server response
    if (err) {
      console.log(err);
    }

}


function m404(response, ip, path) {
    response.writeHead(404, {
        'Content-Type': 'application/json'
    });
    response.end();
    console.log(ip + ' - ' + path + ' 404 Not Found');
}


function help(response, ip) {
    response.writeHead(200, {
        'Content-Type': 'application/json'
    });

    var res = {
      'api': {
        'stats': {
          'api/stats/dns' : 'DNS status [up/down]',
          'api/stats/dhcp' : 'DHCP status [up/down]',
          'api/stats/ipforward' : 'ipforward status [up/down]',
          'api/stats/hostapd' : 'hostapd status [up/down]',
          'api/stats/iptables' : 'iptables status [up/down]',
          'api/stats/wlan' : 'wlan status [up/down]',
          'api/stats/all' : 'dns, dhcp, ipforward, hostapd, iptablesand wlan status [up/down]',
          'api/stats/hoststatus' : 'info about host: hostname, uptime, kernel, ram, net, disk and temperature',
        },
        'list': {
          'api/list/aps' : 'List APs availables with the wifi interface configured in config.json',
          'api/list/clients' : 'List clients connected to the network'
        },
        'help': 'This help'
      }
    };
   
    response.write(JSON.stringify(res, null, 2));
    response.end();
    console.log(ip + ' - Response with help');
    
}


module.exports.help = help;
module.exports.makeResponse = makeResponse;
module.exports.m404 = m404;




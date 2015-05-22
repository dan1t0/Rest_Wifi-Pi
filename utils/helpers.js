'use strict';



// Public

// module.exports.makeResponse = function (err, res, resObj, ipadd, description) {
module.exports.makeResponse = function (response, config) {
    response.writeHead(200, {
        'Content-Type': 'application/json'
    });
    response.write(JSON.stringify(config.err || config.rsp, null, 2));
    response.end();
    console.log(config.ip + ' - Response with ' + config.desc);

    // print all the server response
    if (config.err) {
        console.log(config.err);
    }
};


module.exports.m404 = function (response, ip, path) {
    response.writeHead(404, {
        'Content-Type': 'application/json'
    });
    response.end();
    console.log(ip + ' - ' + path + ' 404 Not Found');
};


module.exports.help = function (response, ip) {
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
                'api/stats/hoststatus' : 'info about host: hostname, uptime, kernel, ram, net, disk and temperature'
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
};

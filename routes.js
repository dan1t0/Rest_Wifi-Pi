'use strict';

// Main controller

var helpers = require('./utils/helpers'),
    statusC = require('./controllers/status'),
    clientsC = require('./controllers/clients'),

    PKG_INFO = require('./package.json'),
    GLOBAL_CFG = require('./config.json');



// Helpers

// function routeStats (response, type, ip, path) {
function routeStats(response, config) {
    switch (config.type) {
        case 'dns': {
            statusC.dnsStat(function (err, rsp) {
                helpers.makeResponse(response, {
                    err: err,
                    rsp: rsp,
                    desc: 'dns stats',
                    ip: config.ip
                });
            });
            break;
        }
        case 'dhcp': {
            statusC.dhcpStat(function (err, rsp) {
                helpers.makeResponse(response, {
                    err: err,
                    rsp: rsp,
                    desc: 'dhcp stats',
                    ip: config.ip
                });
            });
            break;
        }
        case 'ipforward': {
            statusC.ipfowardStat(function (err, rsp) {
                helpers.makeResponse(response, {
                    err: err,
                    rsp: rsp,
                    desc: 'ipforward stats',
                    ip: config.ip
                });
            });
            break;
        }
        case 'hostapd': {
            statusC.hostapdStat(function (err, rsp) {
                helpers.makeResponse(response, {
                    err: err,
                    rsp: rsp,
                    desc: 'hostapd stats',
                    ip: config.ip
                });
            });
            break;
        }
        case 'iptables': {
            statusC.iptablesStat(function (err, rsp) {
                helpers.makeResponse(response, {
                    err: err,
                    rsp: rsp,
                    desc: 'iptables stats',
                    ip: config.ip
                });
            });
            break;
        }
        case 'wlan': {
            statusC.wlanStat(function (err, rsp) {
                helpers.makeResponse(response, {
                    err: err,
                    rsp: rsp,
                    desc: 'wlan stats',
                    ip: config.ip
                });
            });
            break;
        }
        case 'all': {
            statusC.allStatus(function (err, rsp) {
                helpers.makeResponse(response, {
                    err: err,
                    rsp: rsp,
                    desc: 'all stats',
                    ip: config.ip
                });
            });
            break;
        }
        case 'hoststatus': {
            statusC.getHostStatus(function (err, rsp) {
                helpers.makeResponse(response, {
                    err: err,
                    rsp: rsp,
                    desc: 'hoststatus stats',
                    ip: config.ip
                });
            });
            break;
        }
        default: {
            helpers.m404(response, config.ip, config.path);
        }
    }
}


function routeList(response, config) {
    switch (config.type) {
        case 'clients': {
            // interface_id in input
            clientsC.getClients(GLOBAL_CFG.ifaces.ap, function (err, rsp) {
                helpers.makeResponse(response, {
                    err: err,
                    rsp: rsp,
                    desc: 'clients list',
                    ip: config.ip
                });
            });
            break;
        }
        case 'aps': {
            // interface_id in input
            clientsC.getAps(GLOBAL_CFG.ifaces.scan, function (err, rsp) {
                helpers.makeResponse(response, {
                    err: err,
                    rsp: rsp,
                    desc: 'aps list',
                    ip: config.ip
                });
            });
            break;
        }
        default: {
            helpers.m404(response, config.ip, config.path);
        }
    }
}



// Public

module.exports.route = function (path, response, ip) {
    var paths = path.split('/'),
        routeSetup = {
            ip: ip,
            path: path
        };

    //console.log("path: "+path);
    //console.log("ruta: "+paths[1]);
    if (paths[1] === 'api') {
        // resonse status
        if (paths[2] === 'version') {
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.write(JSON.stringify({ version: PKG_INFO.version }, null, 2));
            response.end();
            console.log(ip + ' - Response with the API version: ' + PKG_INFO.version);
        } else if (paths[2] === 'stats') {
            routeSetup.type = paths[3];
            routeStats(response, routeSetup);
        } else if (paths[2] === 'list') {
            routeSetup.type = paths[3];
            routeList(response, routeSetup);
        } else if (paths[2] === 'help') {
            helpers.help(response, ip);
        } else {
            helpers.m404(response, ip, path);
        }
    }  else {
        helpers.m404(response, ip, path);
    }
};

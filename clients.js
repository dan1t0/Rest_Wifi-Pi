'use strict';

var fs = require('fs');
var sqlite3 = require('sqlite3');
var exec = require('child_process').exec,
    
    GLOBAL_CFG = require('./config'),

    child;



function extractVendor(mac_add, ip_s, callback) {
    var db = new sqlite3.Database(GLOBAL_CFG.db.file);
    //managed the mac
    var mac_split = mac_add.split(':');
    var mac = (mac_split[0] + mac_split[1] + mac_split[2]).toUpperCase();
    //mac hex to dec
    mac = parseInt(mac, 16);

    var stmt = db.prepare('select * from oui where macPrefix = ?', mac, function (err) {
        if (err) {
            callback({
                message: 'client.js: extractVendor: db.prepare',
                error: err
            });

            return;
        }
        stmt.get(function (err, row) {
            if (err) {
                console.log('ERROR: extractVendor');
                console.log(err);

                // TODO: Error management
//                return;
            }

            stmt.finalize();
            callback(null, row.vendor,mac_add,ip_s);
        });
    });
}



function getClients (iface,callback) {
    var pending = 0;

    fs.readFile('/proc/net/arp', {encoding:'utf8'},function (err, data) {
        var clients = {
            list: []
        };

        if (err) {
            callback({
                message: 'client.js: getClients: readFile',
                error: err
            });

            return;
        }

        data = data.replace(/\s{2,}/g, ' ');
        data = data.split('\n');

        for (var i=1; i < data.length-1; i++) {
            if (data[i].split(' ')[5] === iface) {
                var ip_s = data[i].split(' ')[0];
                var mac_s = data[i].split(' ')[3];

                pending++;
                extractVendor(mac_s, ip_s, function(err, vendor_s, mac_s, ip_s) {
                    if (err) {
                        callback({
                            message: 'client.js: getClients: extractVendor',
                            error: err
                        });

                        return;
                    }
                    clients.list.push({
                        ip: ip_s,
                        mac: mac_s,
                        vendor: vendor_s,
                        //if iface.ifaces == "wlan*" check the mac with hostapd_cli 
                        online: false
                    });
                    pending--;
                    if (pending === 0) {
                        callback(null, clients);
                    }
                });

            }
        }
      });
}



function iwlistParse(str) {
    var out = str.replace(/^\s+/mg, '');
    out = out.split('\n');
    var cells = [];
    var line;
    var info = {};
    var fields = {
        'mac' : /^Cell \d+ - Address: (.*)/,
        'ssid' : /^ESSID:"(.*)"/,
        'protocol' : /^Protocol:(.*)/,
        'mode' : /^Mode:(.*)/,
        'frequency' : /^Frequency:(.*) \(Channel/,
        'channel' : /\(Channel (.*)\)/,
        'encryption_key' : /Encryption key:(.*)/,
        'bitrates' : /Bit Rates:(.*)/,
        'quality' : /Quality(?:=|\:)([^\s]+)/,
        'signal_level' : /Signal level(?:=|\:)([^\s]+)/
    };

    for (var i=0, l=out.length; i<l; i++) {
        line = out[i].trim();

        if (!line.length) {
            continue;
        }
        if (line.match('Scan completed :$')) {
            continue;
        }
        if (line.match('Interface doesn\'t support scanning.$')) {
            continue;
        }

        if (line.match(fields.mac)) {
            cells.push(info);
            info = {};
        }

        for (var field in fields) {
            if (line.match(fields[field])) {
                info[field] = (fields[field].exec(line)[1]).trim();
            }
            
        }
        //info['vendor'] = '';
    }
    cells.push(info);
    //console.log(cells);
    return cells;
}



function getAps(iface, callback) {

    child = exec('iwlist ' +iface+ ' scan',function (error,stdout) {
        if (error) {
            callback({
                message: 'client.js: getAps: exec',
                error: error
            });

            return;
        }

        callback(null, iwlistParse(stdout));
    });
}



module.exports.getAps = getAps;
module.exports.getClients = getClients;

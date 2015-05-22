'use strict';

var fs = require('fs'),
    execCom = require('child_process').exec,

    ouiM = require('../models/oui');



// Helpers

function extractVendor(mac_add, ip_s, callback) {
    // managed the mac
    var mac_split = mac_add.split(':'),
        mac = (mac_split[0] + mac_split[1] + mac_split[2]).toUpperCase();

    // mac hex to dec
    mac = parseInt(mac, 16);

    ouiM.getByMacPrefix(mac, function (err, stmt) {
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
                // return;
            }

            stmt.finalize();
            callback(null, row.vendor, mac_add, ip_s);
        });
    });
}


function iwlistParse(str) {
    var out = str.replace(/^\s+/mg, ''),
        cells = [],
        info = {},
        fields = {
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
        },
        line, i, field;

    out = out.split('\n');
    for (i = 0; i < out.length; i += 1) {
        line = out[i].trim();

        if (line.length && !line.match('Scan completed :$') &&
            !line.match('Interface doesn\'t support scanning.$')) {
            if (line.match(fields.mac)) {
                cells.push(info);
                info = {};
            }

            for (field in fields) {
                if (line.match(fields[field])) {
                    info[field] = (fields[field].exec(line)[1]).trim();
                }
            }
            //info['vendor'] = '';
        }
    }
    cells.push(info);

    //console.log(cells);
    return cells;
}



// Public

module.exports.getClients = function (iface, callback) {
    var pending = 0;

    fs.readFile(
        '/proc/net/arp',
        {
            encoding: 'utf8'
        },
        function (err, data) {
            var clients = {
                list: []
            },
            i, ip_s, mac_s;

            if (err) {
                callback({
                    message: 'client.js: getClients: readFile',
                    error: err
                });

                return;
            }

            data = data.replace(/\s{2,}/g, ' ');
            data = data.split('\n');

            for (i = 1; i < data.length - 1; i += 1) {
                if (data[i].split(' ')[5] === iface) {
                    ip_s = data[i].split(' ')[0];
                    mac_s = data[i].split(' ')[3];

                    pending++;
                    extractVendor(mac_s, ip_s, function (err, vendorData) {
                        if (err) {
                            callback({
                                message: 'client.js: getClients: extractVendor',
                                error: err
                            });

                            return;
                        }
                        clients.list.push({
                            ip: vendorData.ip_s,
                            mac: vendorData.mac_s,
                            vendor: vendorData.vendor_s,
                            // if iface.ifaces == "wlan*" check the mac with hostapd_cli
                            online: false
                        });
                        pending--;
                        if (pending === 0) {
                            callback(null, clients);
                        }
                    });
                }
            }
        }
    );
};


module.exports.getAps = function (iface, callback) {
    execCom(
        'iwlist ' + iface + ' scan',
        function (error, stdout) {
            if (error) {
                callback({
                    message: 'client.js: getAps: exec',
                    error: error
                });

                return;
            }

            callback(null, iwlistParse(stdout));
        }
    );
};

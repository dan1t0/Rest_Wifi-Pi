'use strict';

var fs = require('fs'),
    async = require('async'),
    execCom = require('child_process').exec,

    fsExtra = require('../utils/statfs'),

    GLOBAL_CFG = require('../config.json'),
    IPT_STAT_FILE = './artifacts/iptables_stats',

    child;



// Helpers

// Get hostname
function readHostname(callback) {
    fs.readFile('/proc/sys/kernel/hostname', { encoding: 'utf-8' }, function (err, hostn) {
        if (err) {
            callback(null, {
                message: 'getStatus.js: readHostname:',
                error: err
            });

            return;
        }

        callback(null, hostn.replace('\n', ''));
    });
}


// Get a human readable string from the host uptime
function uptimeString(time) {
    var uptimeStr = '',
        days, hours, mins;

    if ((time > 60) && (time > 60 * 60) && (time > 60 * 60 * 24)) {
        //more 1 day ON
        days =  Math.floor(time / (60 * 60 * 24));
        //console.log(days+" days");
        time = time - (days * 60 * 60 * 24);
        uptimeStr = uptimeStr + days + ' days ';
    }

    if ((time > 60) && (time > 60 * 60)) {
        //more 1 hour ON
        hours =  Math.floor(time / (60 * 60));
        //console.log(hours+" hours");
        time = time - (hours * 60 * 60);
        uptimeStr = uptimeStr + hours + ' hours ';
    }

    if (time > 60) {
        //more 1 minute ON
        mins =  Math.floor(time / (60));
        //console.log(mins+" mins");
        uptimeStr = uptimeStr + mins + ' mins';
    }
    return uptimeStr;
}


// Get the host uptime
function readUptime(callback) {
    fs.readFile('/proc/uptime', { encoding: 'utf-8' }, function (err, uptime) {
        var finalRes = null,
            lines;

        if (err) {
            callback(null, {
                message: 'getStatus.js: readUptime',
                error: err
            });

            return;
        }

        // Just in case
        lines = uptime.split('\n');
        // If we found a valid one we stop the loop
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some
        lines.some(function (data) {
            var line = data.split(' ');

            if (line[0]) {
                finalRes = uptimeString(line[0]);

                // Found, true will stop iteration
                return true;
            } else {
                return false;
            }
        });
        if (finalRes) {
            callback(null, finalRes);
        } else {
            callback(null, {
                message: 'getStatus.js: readUptime: Not found',
                error: err
            });
        }
    });
}


// Get the host kernel info
function readKernel(callback) {
    fs.readFile('/proc/sys/kernel/osrelease', { encoding: 'utf-8' }, function (err, kernel) {
        if (err) {
            callback(null, {
                message: 'getStatus.js: readKernel:',
                error: err
            });

            return;
        }

        callback(null, kernel.replace('\n', ''));
    });
}


// Get the host temperature
function getTemperature(callback) {
    fs.readFile(
        '/sys/class/thermal/thermal_zone0/temp',
        {
            encoding: 'utf8'
        },
        function (err, temp) {
            // only raspberry pi has the file: /sys/class/thermal/thermal_zone0/temp
            if (err) {
                /*
                callback(null, {
                    message: 'getStatus.js: getTemperature:',
                    error: err
                });
                */
                temp = null;
                callback(null, temp);

                return;
            }

            temp = temp.split('\n')[0];
            //console.log(parseInt(temp.substring(0,4)) / 100);
            temp = (parseInt(temp.substring(0, 4)) / 100);
            //console.log(temp);
            callback(null, temp);
        }
    );
}


// Get host RAM info
function readRam(callback) {
    fs.readFile('/proc/meminfo', { encoding: 'utf-8' }, function (err, ram) {
        var ramData = {},
            lines;

        if (err) {
            callback(null, {
                message: 'getStatus.js: readRam:',
                error: err
            });

            return;
        }

        lines = ram.split('\n');
        lines.forEach(function (data) {
            /* Remove multiple spaces with just one */
            var line = data.replace(/ +(?= )/g, ''),
                field = line.split(' ');

            switch (field[0]) {
                case 'MemFree:':
                    ramData.ram_free = field[1];
                    break;
                case 'Cached:':
                    ramData.ram_cached = field[1];
                    break;
                case 'Buffers:':
                    ramData.ram_buff = field[1];
                    break;
                case 'MemTotal:':
                    ramData.ram_total = field[1];
                    break;
                case 'MemAvailable:':
                    ramData.ram_available = field[1];
                    break;

                case 'SwapTotal:':
                    ramData.swap_total = field[1];
                    break;
                case 'SwapFree:':
                    ramData.swap_free = field[1];
                    break;

            }
        });

        callback(null, ramData);
    });
}


// Get host disk info
function readDisk(callback) {

    var punto_montaje = fsExtra.statfs('/');
    var disk = {};

    var available = parseInt(parseFloat(punto_montaje.f_bavail) * parseFloat(punto_montaje.f_bsize) / 1024 / 1024);
    var free = parseInt(parseFloat(punto_montaje.f_bfree) * parseFloat(punto_montaje.f_bsize) / 1024 / 1024);
    var total = parseInt(parseFloat(punto_montaje.f_blocks) * parseFloat(punto_montaje.f_bsize) / 1024 / 1024 / 1024);

    disk.disk_used = ((total*1000)-available);
    disk.disk_total = (total);
    disk.disk_free = (free);

    callback(null, disk);
}


// Get host network info
function readNet(callback) {
    fs.readFile('/proc/net/dev', { encoding: 'utf-8' }, function (err, netinf) {
        var net_info = [],
            lines;

        if (err) {
            callback(null, {
                message: 'getStatus.js: readNet:',
                error: err
            });

            return;
        }

        lines = netinf.split('\n');
        lines.forEach(function (data) {
            var line = data.replace(/ +/g, ' '),
            err, drop, inter;

            line = line.split(' ');
            if (typeof line[1] !== 'undefined' && line[1].slice(-1) === ':' && line[1] !== 'lo:') {
                //Calc Err/Drop
                err  = parseInt(line[4]) + parseInt(line[12]);
                drop = parseInt(line[5]) + parseInt(line[13]);
                inter = line[1].replace(':', '');

                net_info.push({
                    'int_name': inter,
                    'received': (line[2] / 1024).toFixed(2),
                    'send': (line[10] / 1024).toFixed(2),
                    'rx': line[3],
                    'tx': line[11],
                    'errdrop': err + '/' + drop
                });
            }
        });

        callback(null, net_info);
    });
}


function ipfowardStat(callback) {
    var status = {};

    fs.readFile(
        '/proc/sys/net/ipv4/ip_forward',
        {
            encoding: 'utf8'
        },
        function (err, data) {
            if (err) {
                // We don't want to stop the async chain so we return this error like any
                // other regular result
                callback(null, {
                    message: 'getStatus.js: ipfowardStat:',
                    error: err
                });

                return;
            }

            //console.log(data);
            data = data.split('\n')[0];
            if (data === '0') {
                status.ipfwd = 'down';
            } else {
                status.ipfwd = 'up';
            }

            callback(null, status);
        }
    );
}


function wlanStat(callback) {
    var status = {};

    child = execCom(
        '/sbin/ifconfig | grep ' + GLOBAL_CFG.ifaces.ap + ' | grep -v grep | grep -v "mon."',
        function (error) {
            if (error) {
                status.wlan = 'down';
            } else {
                status.wlan = 'up';
            }
            callback(null, status);
        }
    );
}


function dnsStat(callback) {
    var status = {};

    child = execCom('ps -e | grep -v grep | grep dnsmasq', function (error) {
        if (error) {
            status.dns = 'down';
        } else {
            status.dns = 'up';
        }

        callback(null, status);
    });
}


function dhcpStat(callback) {
    var status = {};

    child = execCom('ps -e | grep -v grep | grep dhcpd', function (error) {
        if (error) {
            status.dhcp = 'down';
        } else {
            status.dhcp = 'up';
        }

        callback(null, status);
    });
}


function hostapdStat(callback) {
    var status = {};

    child = execCom('ps -e | grep -v grep | grep hostapd', function (error) {
        if (error) {
            status.hostapd = 'down';
        } else {
            status.hostapd = 'up';
        }

        callback(null, status);
    });
}


function iptablesStat(callback) {
    var status = {};

    fs.readFile(
        IPT_STAT_FILE,
        {
            encoding: 'utf8'
        },
        function (err, data) {
            data = data.split('\n')[0];
            if (data === '0') {
                status.iptables = 'down';
            } else {
                status.iptables = 'up';
            }

            callback(null, status);
        }
    );
}



// Public

module.exports.getHostStatus = function (callback) {
    async.parallel({
        hostname: readHostname,
        uptime: readUptime,
        kernel: readKernel,
        ram: readRam,
        net: readNet,
        disk: readDisk,
        temp: getTemperature
    },
    function (err, results) {
        // Data massaging
        var stats = {
            hostname: results.hostname,
            uptime: results.uptime,
            kernel: results.kernel,
            ram: results.ram,
            net: results.net,
            temp: results.temp,
            disk: results.disk
        };

        // Fill the structure and return it in the callback
        stats.disk.disk_percent = (parseFloat((results.disk.disk_used/(results.disk.disk_total*1024))*100).toFixed(2));

        stats.ram.ram_used = (results.ram.ram_total - results.ram.ram_available);
        stats.ram.ram_percent = parseFloat(((stats.ram.ram_used*100) / stats.ram.ram_total).toFixed(2));

        stats.ram.swap_used = (results.ram.swap_total - results.ram.swap_free);
        stats.ram.swap_percent = (parseFloat((results.ram.swap_used/results.ram.swap_total)*100).toFixed(2));


        callback(null, stats);
    });
};


// get iptables rules apply
module.exports.iptablesStat = iptablesStat;


// get hostapd status
module.exports.hostapdStat = hostapdStat;

// get dhcp status
module.exports.dhcpStat = dhcpStat;


// get dns status
module.exports.dnsStat = dnsStat;


// get wlan status
module.exports.wlanStat = wlanStat;


// get ipforward status
module.exports.ipfowardStat = ipfowardStat;


// get all the status
module.exports.allStatus =  function (callback) {
    async.parallel({
        dns: dnsStat,
        dhcp: dhcpStat,
        ipfwd: ipfowardStat,
        hostapd: hostapdStat,
        ipTables: iptablesStat,
        wlan: wlanStat
    }, function (err, results) {
        // We're never returning an error to stop breaking the loop

        // Data massaging
        var status = {
            dns: results.dns.dns,
            dhcp: results.dhcp.dhcp,
            ipfwd: results.ipfwd.ipfwd,
            hostadp: results.hostapd.hostapd,
            ipTables: results.ipTables.iptables,
            wlan: results.wlan.wlan
        };

        /* //only to debug
        console.log("dns: "+results.dns.dns);
        console.log("dhcp: "+results.dhcp.dhcp);
        console.log("ipfwd: "+results.ipfwd.ipfwd);
        console.log("hostadp: "+results.hostapd.hostapd);
        console.log("ipTables: "+results.ipTables.iptables);
        console.log("wlan: "+results.wlan.wlan);
        */

        callback(null, status);
    });
};

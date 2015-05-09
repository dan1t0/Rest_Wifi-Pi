'use strict';

var fs = require('fs');
var async = require('async');
var exec = require('child_process').exec;

var fs_extra = require("./statfs.js");

var GLOBAL_CFG = require('./config');

var child;


// get dns status
function dnsStat(callback) {
   var status = {};
   child = exec('ps -e | grep -v grep | grep dnsmasq',function (error) {

      if (error) {
         status.dns = "down";
      } else {
         status.dns = "up";
      }

      callback(null, status);
    });
}


// get dhcp status
function dhcpStat(callback) {
   var status = {};
   child = exec('ps -e | grep -v grep | grep dhcpd',function (error) {

      if (error) {
         status.dhcp = "down";
      } else {
         status.dhcp = "up";
      }

      callback(null, status);
    });
}


// get hostapd status
function hostapdStat(callback) {
   var status = {};
   child = exec('ps -e | grep -v grep | grep hostapd',function (error) {

      if (error) {
         status.hostapd = "down";
      } else {
         status.hostapd = "up";
      }

      callback(null, status);
    });
}


// get hostapd status
function wlanStat(callback) {
   var status = {};
   child = exec('/sbin/ifconfig | grep '+GLOBAL_CFG.ifaces.ap+' | grep -v grep | grep -v "mon."',function (error) {

      if (error) {
         status.wlan = "down";
      } else {
         status.wlan = "up";
      }

      callback(null, status);
    });
}


//get ipforward status
function ipfowardStat(callback) {
    var status = {};
    fs.readFile('/proc/sys/net/ipv4/ip_forward', {encoding:'utf8'},function (err, data) {
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
        data = data.split("\n")[0];
        if (data==="0") {
            status.ipfwd = "down";
        } else {
            status.ipfwd = "up";
        }

        callback(null, status);
      });

}


//get iptables rules apply
function iptablesStat(callback) {
    var status = {};
    var iptStatFile = "iptables_stats";

    fs.readFile(iptStatFile, {encoding:'utf8'},function (err, data) {

        //console.log(data);
        data = data.split("\n")[0];
        if (data==="0") {
            status.iptables = "down";
        } else {
            status.iptables = "up";
        }

        callback(null, status);
      });

}


//get all the status
function allStatus(callback) {
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
        }

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
}


// GET HOSTNAME
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


// GET UPTIME
function readUptime(callback) {
    var finalResponse = null;
    
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


function uptimeString(time) {
    var uptimeStr='';
    if ((time > 60) && (time > 60*60) && (time > 60*60*24)) {
        //more 1 day ON
        var days =  Math.floor(time/(60*60*24));
        //console.log(days+" days");
        time = time - (days*60*60*24);
        uptimeStr = uptimeStr + days+" days ";
    }

    if ((time > 60) && (time > 60*60)) {
        //more 1 hour ON
        var hours =  Math.floor(time/(60*60));
        //console.log(hours+" hours");
        time = time - (hours*60*60);
        uptimeStr = uptimeStr + hours+" hours ";
    }

    if (time > 60) {
        //more 1 minute ON
        var mins =  Math.floor(time/(60));
        //console.log(mins+" mins");
        uptimeStr = uptimeStr + mins+" mins";
    }
    return uptimeStr;
}


// GET KERNEL
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


function getTemperature(callback) {
    fs.readFile(
        '/sys/class/thermal/thermal_zone0/temp',
        {
            encoding: 'utf8'
        },
        function (err, temp) {
            if (err) {
                callback(null, {
                    message: 'getStatus.js: getTemperature:',
                    error: err
                });

                return;
            }
        
            temp = temp.split("\n")[0];
            //console.log(parseInt(temp.substring(0,4))/100);
            temp =(parseInt(temp.substring(0,4))/100);
            //console.log(temp);
            callback(null, temp);
        }
    );
}


// GET RAM INFO
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
            var line = data.replace(/ +(?= )/g,'');
            var field = line.split(' ');
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


// GET DISK INFO
function readDisk(callback) {

    var punto_montaje = fs_extra.statfs("/");
    var disk = {};

    var available = parseInt(parseFloat(punto_montaje.f_bavail) * parseFloat(punto_montaje.f_bsize) / 1024 / 1024);
    var free = parseInt(parseFloat(punto_montaje.f_bfree) * parseFloat(punto_montaje.f_bsize) / 1024 / 1024);
    var total = parseInt(parseFloat(punto_montaje.f_blocks) * parseFloat(punto_montaje.f_bsize) / 1024 / 1024 / 1024);

    disk.disk_used = ((total*1000)-available);
    disk.disk_total = (total);
    disk.disk_free = (free);

    callback(null, disk);
}


// GET NETWORK INFO
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
            var line = data.replace(/ +/g,' ');
            line = line.split(' ');
            if (typeof line[1] === "undefined" ) {
                // do nothing
            }
            else if ((line[1].slice(-1) == ":") && (typeof line[1] != "undefined") && ( line[1]!= "lo:")) {
                //Calc Err/Drop
                var err  = parseInt(line[4])+parseInt(line[12]);
                var drop = parseInt(line[5])+parseInt(line[13]);
                var inter = line[1].replace(':','');
                net_info.push({
                    "int_name": inter,
                    "received": (line[2]/1024).toFixed(2),
                    "send": (line[10]/1024).toFixed(2),
                    "rx": line[3],
                    "tx": line[11],
                    "errdrop": err+'/'+drop
                });
            }
        });

        callback(null, net_info);
    });
}


function getHostStatus(callback) {
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
}


module.exports.getHostStatus = getHostStatus;
module.exports.allStatus = allStatus;
module.exports.iptablesStat = iptablesStat;
module.exports.hostapdStat = hostapdStat;
module.exports.dhcpStat = dhcpStat;
module.exports.dnsStat = dnsStat;
module.exports.wlanStat = wlanStat;
module.exports.ipfowardStat = ipfowardStat;

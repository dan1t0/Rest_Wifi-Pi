var fs = require('fs');
var async = require('async');
var exec = require('child_process').exec,
    child;



// get dns status
function dnsStat(callback) {
   var status = {};
   //child = exec('ps -e | grep -v grep | grep dnsmasq', {shell:'/bin/bash'},function (error, stdout,stderr) {
   child = exec('ps -e | grep -v grep | grep dnsmasq',function (error) {

      //console.log('stdout: ' + stdout);
      //console.log('stderr: ' + stderr);
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
   //child = exec('ps -e | grep -v grep | grep dnsmasq', {shell:'/bin/bash'},function (error, stdout,stderr) {
   child = exec('ps -e | grep -v grep | grep dhcpd',function (error) {

      //console.log('stdout: ' + stdout);
      //console.log('stderr: ' + stderr);
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
   //child = exec('ps -e | grep -v grep | grep dnsmasq', {shell:'/bin/bash'},function (error, stdout,stderr) {
   child = exec('ps -e | grep -v grep | grep hostapd',function (error) {

      //console.log('stdout: ' + stdout);
      //console.log('stderr: ' + stderr);
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
   //child = exec('ps -e | grep -v grep | grep dnsmasq', {shell:'/bin/bash'},function (error, stdout,stderr) {
   child = exec('/sbin/ifconfig | grep wlan0 | grep -v grep | grep -v "mon."',function (error) {

      //console.log('stdout: ' + stdout);
      //console.log('stderr: ' + stderr);
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
    var iptStatFile = "/var/www/admin/scripts/iptables_stats";
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
        if (err) {
            console.log("Error al ejecutar la serie");
            callback(true, results);
        } else {
            var status = {};

            /* //only to debug
            console.log("dns: "+results.dns.dns);
            console.log("dhcp: "+results.dhcp.dhcp);
            console.log("ipfwd: "+results.ipfwd.ipfwd);
            console.log("hostadp: "+results.hostapd.hostapd);
            console.log("ipTables: "+results.ipTables.iptables);
            console.log("wlan: "+results.wlan.wlan);
            */
            
            status.dns = results.dns.dns;
            status.dhcp = results.dhcp.dhcp;
            status.ipfwd = results.ipfwd.ipfwd;
            status.hostadp = results.hostapd.hostapd;
            status.ipTables = results.ipTables.iptables;
            status.wlan = results.wlan.wlan;

            callback(null, status);
        }
    });
}
/*
   /api?stats=
      dns         -> {"dns":"up"}
      dhcp        -> {"dhcp":"up"}
      ipfwd  -> {"ip-forward":"up"}
      hostadp     -> {"hostadp":"up"}
      ipTables    -> {"ipTables":"up"}
      wlan        -> {"wlan":"up"}
      all         -> {"dns":"up","dhcp":"up","ip-forward":"up",
                        "hostadp":"up","ipTables":"up","wlan":"up"}

*/



module.exports.allStatus = allStatus;
module.exports.iptablesStat = iptablesStat;
module.exports.hostapdStat = hostapdStat;
module.exports.dhcpStat = dhcpStat;
module.exports.dnsStat = dnsStat;
module.exports.wlanStat = wlanStat;
module.exports.ipfowardStat = ipfowardStat;

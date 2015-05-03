var fs = require('fs');
var sqlite3 = require('sqlite3');
var exec = require('child_process').exec,
    child;


function getClients (interface,callback) {
    var pending = 0;

    fs.readFile("/proc/net/arp", {encoding:'utf8'},function (err, data) {

        var clients ={
            list: []
        };

        data = data.replace(/\s{2,}/g, ' ');
        data = data.split("\n");

        for (var i=1; i<data.length-1; i++) {
            if (data[i].split(" ")[5] == interface) {
                var ip_s = data[i].split(" ")[0];
                var mac_s = data[i].split(" ")[3];

                pending++;
                extractVendor(mac_s,ip_s,function(err,vendor_s,mac_s,ip_s){

                    clients.list.push({
                        ip: ip_s,
                        mac: mac_s,
                        vendor: vendor_s,
                        online: false
                    });
                    pending--;
                    if (pending === 0)
                        callback(null, clients);
                });

            }
        }
        //callback(null, clients);
      });

}


function extractVendor (mac_add,ip_s, callback) {

    var db = new sqlite3.Database('mac_vendors.sqlite');

    //managed the mac
    var mac_split = mac_add.split(":");
    var mac = (mac_split[0]+mac_split[1]+mac_split[2]).toUpperCase();

    //mac hex to dec
    mac = parseInt(mac, 16);

    db.each("select * from OUI where macPrefix = '"+mac+".0'", function(err, row) {
      var vendor = row.vendor;

      callback(null,vendor,mac_add,ip_s);
    });
};


function getAps(interface,callback) {
   var status = {};
   child = exec('iwlist '+interface+' scan',function (error,stdout) {

      var aps = iwlistParse(stdout);

      callback(null, aps);
    });
}



//add vendor and split field frequency in frequensy and channel
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
        'frequency' : /^Frequency:(.*)/,
        'encryption_key' : /Encryption key:(.*)/,
        'bitrates' : /Bit Rates:(.*)/,
        'quality' : /Quality(?:=|\:)([^\s]+)/,
        'signal_level' : /Signal level(?:=|\:)([^\s]+)/
    };

    for (var i=0,l=out.length; i<l; i++) {
        line = out[i].trim();

        if (!line.length) {
            continue;
        }
        if (line.match("Scan completed :$")) {
            continue;
        }
        if (line.match("Interface doesn't support scanning.$")) {
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
    }
    cells.push(info);
    //console.log(cells);
    return cells;
}



module.exports.getAps = getAps;
module.exports.getClients = getClients;

var fs = require('fs');
var sqlite3 = require('sqlite3');


function getClients (callback) {
    fs.readFile("/proc/net/arp", {encoding:'utf8'},function (err, data) {

        var clients ={
            list: []
        };
        //console.log(data);
        //data = data.split("\n");
        //data = data.split(" ");
        data = data.replace(/\s{2,}/g, ' ');
        data = data.split("\n");
        //console.log(data);
        //console.log(data[1].split(" ")[2]);
        for (var i=1; i<data.length-1; i++) {
            //console.log(data[i].split(" ")[0]+' '+data[i].split(" ")[3]);
            if (data[i].split(" ")[5] == "wlan0") {
                clients.list.push({
                    ip: data[i].split(" ")[0],
                    mac: data[i].split(" ")[3],
                    vendor: "unknown",
                    online: false
                });
            }
        }
        //console.log(clients);
        //var clients = "OK";
        callback(null, clients);
      });

}


module.exports.getClients = getClients;

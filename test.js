var fs = require('fs');

fs.readFile('caca.txt', {encoding:'utf8'},function (err, data) {

    //console.log(data);
    //data = data.split("\n")[0];
    data = data.replace(/\s{2,}/g, ' ');
    data = data.split("\n");

    console.log(data);

    callback(null, status);
  });

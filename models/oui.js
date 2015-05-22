'use strict';

var sqlite3 = require('sqlite3'),

    GLOBAL_CFG = require('../config'),

    db = new sqlite3.Database(GLOBAL_CFG.db.file);



// Public

module.exports.getByMacPrefix = function (prefix, callback) {
    var result = null;

    result = db.prepare(
        'select * from oui where macPrefix = ?',
        prefix,
        function (err) {
            callback(err, result);
        }
    );
};

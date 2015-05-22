'use strict';

var ffi = require('ffi'),
    ref = require('ref'),
    Struct = require('ref-struct');



// Public

/**
 * Native libc binding for statfs() function
 *
 * @param path: The path of the filesystem to get stats from
 * @returns {*}: null on error or JSON containing statfs struct on success (check "man statfs")
 *
 * By Jaime Peñalba - https://twitter.com/nighterman
 */
module.exports.statfs = function (path) {
    var StructStatfs = Struct({
        'f_type': 'long',
        'f_bsize': 'long',
        'f_blocks': 'long',
        'f_bfree': 'long',
        'f_bavail': 'long',
        'f_files': 'long',
        'f_ffree': 'long'
    }),
    statfsPtr = ref.refType(StructStatfs),
    current = ffi.Library(null, {
        'statfs': ['int', ['string', statfsPtr]]
    }),
    buf = new StructStatfs(),
    res = current.statfs(path, buf.ref());

    if (res !== 0) {
        return null;
    } else {
        return buf;
    }
};

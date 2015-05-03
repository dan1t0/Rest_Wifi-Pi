var ffi = require('ffi');
var ref = require('ref');
var Struct = require("ref-struct");


/**
 * Native libc binding for statfs() function
 *
 * @param path: The path of the filesystem to get stats from
 * @returns {*}: null on error or JSON containing statfs struct on success (check "man statfs")
 *
 * By Jaime Peñalba - https://twitter.com/nighterman
 */
function statfs(path) {

    var StructStatfs = Struct({
        'f_type': 'long',
        'f_bsize': 'long',
        'f_blocks': 'long',
        'f_bfree': 'long',
        'f_bavail': 'long',
        'f_files': 'long',
        'f_ffree': 'long'
    });

    var statfsPtr = ref.refType(StructStatfs);

    var current = ffi.Library(null, {
        'statfs': [ 'int', [ 'string', statfsPtr] ]
    });

    var buf = new StructStatfs();
    var res = current.statfs(path, buf.ref());

    if (res != 0)
        return null;
    else
        return buf;
}


module.exports.statfs = statfs;

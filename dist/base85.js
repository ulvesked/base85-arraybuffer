"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decode = exports.decodeString = exports.encode = exports.encodeString = void 0;
var utf8 = require("./utf8");
var BASE85_CHARS_Z85 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.-:+=^!/*?&<>()[]{}@%$#";
function resizeArrayBuffer(buffer, offset, length) {
    if (offset == 0 && length == buffer.byteLength) {
        return buffer;
    }
    else if (length > buffer.byteLength) {
        if (typeof (ArrayBuffer.transfer) == 'function') {
            return ArrayBuffer.transfer(buffer, length);
        }
        else {
            var result = new ArrayBuffer(length);
            var dst = new Uint8Array(result);
            var src = new Uint8Array(buffer, offset, buffer.byteLength - offset);
            for (var i = 0; i < src.length; i++) {
                dst[i] = src[i];
            }
            return result;
        }
    }
    else {
        return buffer.slice(0, length);
    }
}
function encodeString(input) {
    var bytes = utf8.encodeUTF8(input);
    var a = [];
    for (var i = 0; i < bytes.length; i++) {
        a.push(bytes[i].toString(16));
    }
    return encode(bytes);
}
exports.encodeString = encodeString;
function encode(input, options) {
    var prefix = null, suffix = null;
    var ascii85 = !options || !options.variant || options.variant == "ascii85";
    var z = ascii85 && options && options.zeroesAsZ;
    var y = ascii85 && options && options.spacesAsY;
    var buf, byteOffset, byteLength;
    if (ArrayBuffer.isView(input)) {
        buf = input.buffer;
        byteOffset = input.byteOffset;
        byteLength = input.byteLength;
    }
    else {
        buf = input;
        byteOffset = 0;
        byteLength = input.byteLength;
    }
    var mod = byteLength % 4;
    var padding = 0;
    if (mod) {
        padding = 4 - mod;
        buf = resizeArrayBuffer(buf, byteOffset, byteLength + padding);
        byteOffset = 0;
        byteLength = buf.byteLength;
    }
    var data = new DataView(buf, byteOffset, byteLength);
    var result = [];
    if (prefix !== null) {
        result.push(prefix);
    }
    for (var i = 0; i < data.byteLength; i += 4) {
        var num = data.getUint32(i, false);
        if (num === 0x00000000 && z) {
            result.push('z');
        }
        else if (num === 0x20202020 && y) {
            result.push('y');
        }
        else {
            for (var x = 4; x >= 0; x--) {
                var pow = Math.pow(85, x);
                var mod_1 = num % pow;
                num = Math.floor(num / pow);
                var char = void 0;
                if (ascii85) {
                    char = String.fromCharCode(num + 33);
                }
                else {
                    char = BASE85_CHARS_Z85[num];
                }
                result.push(char);
                num = mod_1;
            }
        }
    }
    if (padding > 0) {
        result.splice(result.length - padding, padding);
    }
    return result.join("");
}
exports.encode = encode;
function decodeString(data) {
    var bytes = decode(data);
    return utf8.decodeUTF8(new Uint8Array(bytes));
}
exports.decodeString = decodeString;
function decode(data, options) {
    var ascii85 = !options || !options.variant || options.variant == "ascii85";
    var z = ascii85 && options && options.zeroesAsZ;
    var y = ascii85 && options && options.spacesAsY;
    if (z) {
        data = data.replace(/z/g, '!!!!!');
    }
    if (y) {
        data = data.replace(/y/g, '+<VdL');
    }
    data = data.replace(/\s+/g, '');
    var len = data.length;
    var mod = len % 5;
    var padding = 0;
    if (mod) {
        padding = 5 - mod;
        data += "uuuuu".substr(0, padding);
        len = data.length;
    }
    var byteLength = len * 4 / 5;
    var buf = new ArrayBuffer(byteLength);
    var result = new DataView(buf);
    var num = 0;
    var offset = 0;
    for (var i = 0; i < len; i++) {
        var val = void 0;
        if (ascii85) {
            val = data.charCodeAt(i) - 33;
        }
        else {
            val = BASE85_CHARS_Z85.indexOf(data[i]);
            if (val == -1) {
                throw new Error('Failed to decode Z85 encoded string. Invalid char at index ' + i);
            }
        }
        num = num * 85 + val;
        if (i % 5 == 4) {
            result.setUint32(offset, num, false);
            num = 0;
            offset += 4;
        }
    }
    if (padding) {
        return buf.slice(0, byteLength - padding);
    }
    else {
        return buf;
    }
}
exports.decode = decode;

import * as utf8 from './utf8';

const BASE85_CHARS_Z85 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.-:+=^!/*?&<>()[]{}@%$#";

export type Base85Variant = "ascii85" | "z85";
export interface Base85Options {
    variant?: Base85Variant;
    zeroesAsZ?: boolean;
    spacesAsY?: boolean;
}

function resizeArrayBuffer(buffer: ArrayBuffer, offset: number, length: number) {
	if (offset == 0 && length == buffer.byteLength) {
		return buffer;
	}
	else if (length > buffer.byteLength) {
		if (typeof ((<any>ArrayBuffer).transfer) == 'undefined') {
			return (<any>ArrayBuffer).transfer(buffer, length);
		}
		else {
			let result = new ArrayBuffer(length);
			let dst = new Uint8Array(result);
			let src = new Uint8Array(buffer, offset, buffer.byteLength - offset);
			for (let i = 0; i < src.length; i++) {
				dst[i] = src[i];
			}
			return result;
		}
	}
	else {
		return buffer.slice(0, length);
	}
}

export function encodeString(input: string) {
	let bytes = utf8.encodeUTF8(input);
	let a = [];
	for (var i = 0; i < bytes.length; i++) {
		a.push(bytes[i].toString(16));
	}
	return encode(bytes);
}

export function encode(input: ArrayBuffer | ArrayBufferView): string;
export function encode(input: ArrayBuffer | ArrayBufferView, options: Base85Options): string;
export function encode(input: ArrayBuffer | ArrayBufferView, options?: Base85Options) {
    
    let prefix = null, suffix = null;

    let ascii85 = !options || !options.variant || options.variant == "ascii85";

    let z = ascii85 && options && options.zeroesAsZ;
    let y = ascii85 && options && options.spacesAsY;
    

	let buf: ArrayBuffer, byteOffset: number, byteLength: number;
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

	let mod = byteLength % 4;
	let padding = 0;
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

	for (let i = 0; i < data.byteLength; i += 4) {
		var num = data.getUint32(i, false);

		if (num === 0x00000000 && z) {
			result.push('z');
		}
		else if (num === 0x20202020 && y) {
			result.push('y');
		}
		else {
			for (let x = 4; x >= 0; x--) {
				let pow = Math.pow(85, x);
				let mod = num % pow;
                num = Math.floor(num / pow);
                let char: string;
                if (!ascii85) {
                    char = String.fromCharCode(num + 33);
                }
                else {
                    char = BASE85_CHARS_Z85[num];
                }
				result.push(char);
				num = mod;
			}
		}
	}
	if (padding > 0) {
		result.splice(result.length - padding, padding);
	}
	return result.join("");

}

export function decodeString(data: string) {
	let bytes = decode(data);
	return utf8.decodeUTF8(new Uint8Array(bytes));
}

export function decode(data: string): ArrayBuffer;
export function decode(data: string, options: Base85Options): ArrayBuffer;
export function decode(data: string, options?: Base85Options) {

    let ascii85 = !options || !options.variant || options.variant == "ascii85";

    let z = ascii85 && options && options.zeroesAsZ;
    let y = ascii85 && options && options.spacesAsY;
    
    if (z) {
        data = data.replace(/z/g, '!!!!!');
    }
    if (y) {
        data = data.replace(/y/g, '+<VdL');
    }

    data = data.replace(/\s+/g, '');
    
	let len = data.length;
	let mod = len % 5;
	let padding = 0;
	if (mod) {
		padding = 5 - mod;
		data += "uuuuu".substr(0, padding);
		len = data.length;
	}
	let byteLength = len * 4 / 5;
	var buf = new ArrayBuffer(byteLength);
	var result = new DataView(buf);
	let num = 0;
	let offset = 0;
	for (let i = 0; i < len; i++) {
        let val: number;
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
			result.setUint32(offset, num);
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
# base85-arraybuffer

Base85 encoding and decoding using ArrayBuffers with no external dependencies and can be run outside NodeJS.

## Prerequisites

Your JavaScript engine should support ArrayBuffers. Most modern browsers support this, as well as NativeScript, Node.JS and more. 

## Installation

```javascript
npm install base85-arraybuffer --save
```

## Usage 

Use 
	
```javascript
Usage code snippets here
```

## API
    
### encode

Encode an ArrayBuffer or ArrayBufferView (like Uint8Array or other Typed Arrays)
```javascript
encode(data: ArrayBuffer | ArrayBufferView, options?: Base85Options): string;
```

### encodeString
Encodes a UTF-8 string 
```javascript
encodeString(data: string, options?: Base85Options): string;
```

### decode
Decodes a Base85-encoded string to an ArrayBuffer.
```javascript
decode(data: string, options?: Base85Options): ArrayBuffer;
```

### decodeString
Decodes a Base85-encoded string to a UTF-8 string
```javascript
decodeString(data: string, options?: Base85Options): string;
```

### Base85Options

| Property | Default | Description |
| --- | --- | --- |
| variant | Defaults to `ascii85` | The encoding variant to use. Possible values are `ascii85` and `z85` |
| zeroesAsZ | false | Should a group of all zeroes be encoded as a single `z` (`ascii85` only) |
| spacesAsY | false | Should a group of all spaces be encoded as a single `y` (`ascii85` only) |

## License

base85-arraybuffer is licensed under the [MIT license](http://opensource.org/licenses/MIT).
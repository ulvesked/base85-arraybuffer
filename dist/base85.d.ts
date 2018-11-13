export declare type Base85Variant = "ascii85" | "z85";
export interface Base85Options {
    variant?: Base85Variant;
    zeroesAsZ?: boolean;
    spacesAsY?: boolean;
}
export declare function encodeString(input: string): string;
export declare function encode(input: ArrayBuffer | ArrayBufferView): string;
export declare function encode(input: ArrayBuffer | ArrayBufferView, options: Base85Options): string;
export declare function decodeString(data: string): string;
export declare function decode(data: string): ArrayBuffer;
export declare function decode(data: string, options: Base85Options): ArrayBuffer;

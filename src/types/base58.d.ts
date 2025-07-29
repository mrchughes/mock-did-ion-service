declare module 'base58' {
    export function encode(buffer: Buffer | Uint8Array | number[]): string;
    export function decode(string: string): Buffer;
}
declare module "@ffmpeg/ffmpeg" {
  export interface CreateFFmpegOptions {
    log?: boolean;
    mainName?: string;
    corePath?: string;
  }

  export interface FFmpeg {
    isLoaded(): boolean;
    load(options?: { corePath?: string; wasmBinary?: Uint8Array }): Promise<void>;
    run(...args: string[]): Promise<void>;
    FS(method: "writeFile", path: string, data: Uint8Array | string): void;
    FS(method: "readFile", path: string): Uint8Array;
    FS(method: string, path: string, data?: Uint8Array | string): Uint8Array | void;
  }

  export function createFFmpeg(options?: CreateFFmpegOptions): FFmpeg;
  export function fetchFile(
    source: string | File | ArrayBuffer | Buffer | Uint8Array
  ): Promise<Uint8Array>;
}

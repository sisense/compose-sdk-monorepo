export interface Writer {
  write(stream: NodeJS.WritableStream, ident: number): any;
}

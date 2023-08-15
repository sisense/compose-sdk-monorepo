import { Duplex } from 'stream';

export interface InMemoryDuplexStream extends Duplex {
  getStringData: () => string;
}

export function createInMemoryDuplexStream(): InMemoryDuplexStream {
  let stringData = '';

  const duplexStream = new Duplex({
    write(chunk: string, _, callback) {
      stringData += chunk;
      callback();
    },
    read(size) {
      // If there is no more data to read, push null
      if (stringData.length === 0) {
        this.push(null);
        return;
      }

      // Read data from the stringData
      const chunk = stringData.slice(0, size);
      stringData = stringData.slice(size);
      this.push(chunk);
    },
  }) as InMemoryDuplexStream;

  function getStringData(): string {
    return stringData;
  }

  duplexStream.getStringData = getStringData;
  return duplexStream;
}

import {
  createInMemoryDuplexStream,
  InMemoryDuplexStream,
} from './create-in-memory-duplex-stream.js';

describe('createInMemoryDuplexStream', () => {
  let duplexStream: InMemoryDuplexStream;

  beforeEach(() => {
    duplexStream = createInMemoryDuplexStream();
  });

  test('should write data to the stream and read it back correctly', () => {
    const dataToWrite = 'Hello, world!';
    duplexStream.write(dataToWrite);
    duplexStream.end();

    const receivedData = duplexStream.getStringData();
    expect(receivedData).toBe(dataToWrite);
  });

  test('should read data from the stream in chunks', () => {
    const dataToWrite = 'This is a long message that will be read in chunks.';
    const chunkSize = 10;

    duplexStream.write(dataToWrite);
    duplexStream.end();

    let receivedData = '';
    let chunk: string | null;

    while ((chunk = duplexStream.read(chunkSize) as string)) {
      receivedData += chunk;
    }

    expect(receivedData).toBe(dataToWrite);
  });

  test('should read null from the stream when no more data is available', () => {
    const dataToWrite = 'Read me!';
    const chunkSize = 5;

    duplexStream.write(dataToWrite);
    duplexStream.end();

    let receivedData = '';
    let chunk: string | null;

    while ((chunk = duplexStream.read(chunkSize) as string | null)) {
      receivedData += chunk;
    }

    expect(receivedData).toBe(dataToWrite);
    expect(chunk).toBeNull();
  });

  test('should return an empty string if no data was written to the stream', () => {
    const receivedData = duplexStream.getStringData();
    expect(receivedData).toBe('');
  });
});

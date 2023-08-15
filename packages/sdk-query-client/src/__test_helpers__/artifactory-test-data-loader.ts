import axios from 'axios';
import tar from 'tar';
import type { ReadEntry } from 'tar';
import zlib from 'zlib';
import path from 'path';
import fs from 'fs/promises';
import type { Readable as ReadableStream } from 'stream';

export async function downloadTestDataFromArtifactory<TestData>(
  fileName: string,
): Promise<TestData> {
  const url = `https://artifactory.sisense.com:443/artifactory/pytest-data/develop/compose-sdk/${fileName}.tar.gz`;
  const response = await axios.get<ReadableStream>(url, { responseType: 'stream' });

  // Extract the JSON file from the archive and parse its content
  return new Promise((resolve, reject) => {
    response.data
      .pipe(zlib.createGunzip())
      .pipe(
        tar.extract({
          filter: (filePath) => filePath === `${fileName}.json`,
          cwd: path.resolve(__dirname),
        }),
      )
      .on('entry', (entry: ReadEntry) => {
        if (entry.type === 'File') {
          const chunks: any[] = [];
          entry
            .on('data', (chunk: any) => {
              chunks.push(chunk);
            })
            .on('end', () => {
              const chunkString = Buffer.concat(chunks).toString();
              const data = JSON.parse(chunkString) as TestData;
              resolve(data);
            })
            .on('error', (err: Error) => {
              reject(err);
            });
        }
      })
      .on('error', (err: Error) => {
        reject(err);
      })
      .on('end', () => {
        // tar always writing file to the file system. Remove this file after unzipping finished.
        void fs.rm(path.join(__dirname, `${fileName}.json`));
      });
  });
}

import fs from 'fs';
import {createApiClient} from '@natlibfi/melinda-record-import-commons';
import {recordImportApiOptions, keycloakOptions} from '../../config.ts';
import {handleError} from '../utils.ts';

export const command = 'readContent <id> [file]';
export const desc = 'Read blob content by <id> to [file]';
export const builder = {};
export const handler = async function (argv) {
  const client = await createApiClient(recordImportApiOptions, keycloakOptions);
  const {id, file} = argv;
  console.log('Reading blob content by id %s to file %s', id, file);
  try {
    const {readStream} = await client.getBlobContent({id});
    const chunks: string[] = [];

    const writeStream = fs.createWriteStream(file);

    await new Promise<void>((resolve, reject) => {
      readStream
        .on('error', reject)
        .on('data', (chunk: string) => chunks.push(chunk))
        .on('end', () => {
          writeStream.write(chunks.join(''));
          // chunks.forEach(chunk => writeStream.write(chunk));
          writeStream.end();
          resolve();
        });
    });

    console.log(`Wrote blob content to file ${file}`);
    return;
  } catch (err) {
    handleError(err);
  }
};
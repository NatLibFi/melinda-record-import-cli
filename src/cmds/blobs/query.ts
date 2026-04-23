import fs from 'fs';
import path from 'path';
import {createApiClient} from '@natlibfi/melinda-record-import-commons';
import {recordImportApiOptions, keycloakOptions} from '../../config.ts';
import {handleError, getQuery, format} from '../utils.ts';
import {BLOB_STATE} from '@natlibfi/melinda-record-import-commons';

export const command = 'query [options]';
export const desc = `Query blobs:
       - Profile when interested on multiple use , reparator
       - State when interested on multiple use , reparator
       - States available: ${Object.values(BLOB_STATE)}
       - Timestamp formats for options: YYYY-MM-DD or YYYY-MM-DDThh:mm:ss±hh`;
export const builder = function (yargs) {
  return yargs
    .options({
      'f': {
        alias: 'file',
        type: 'string',
        describe: 'Save queryed blobs to file',
        requiresArg: true
      },
      'p': {
        alias: 'profile',
        type: 'string',
        describe: 'Query blobs by profile(s) e.g. profile or progile1,profile2',
        requiresArg: true
      },
      's': {
        alias: 'state',
        type: 'string',
        describe: 'Query blobs by state(s) e.g. STATE or STATE1,STATE2',
        requiresArg: true
      },
      'b': {
        alias: 'createdBefore',
        type: 'string',
        describe: 'Query blobs created before time',
        requiresArg: true,
        conflicts: ['d']
      },
      'a': {
        alias: 'createdAfter',
        type: 'string',
        describe: 'Query blobs created after time',
        requiresArg: true,
        conflicts: ['d']
      },
      'B': {
        alias: 'modifiedBefore',
        type: 'string',
        describe: 'Query blobs modified before time',
        requiresArg: true,
        conflicts: ['D']
      },
      'A': {
        alias: 'modifiedAfter',
        type: 'string',
        describe: 'Query blobs modified after time',
        requiresArg: true,
        conflicts: ['D']
      },
      'd': {
        alias: 'createdDay',
        type: 'string',
        describe: 'Query blobs created by day',
        requiresArg: true,
        conflicts: ['a', 'b']
      },
      'D': {
        alias: 'modifiedDay',
        type: 'string',
        describe: 'Query blobs modified by day',
        requiresArg: true,
        conflicts: ['A', 'B']
      },
      'skip': {
        type: 'string',
        describe: 'Query blobs and skip n records',
        requiresArg: true
      },
      'limit': {
        type: 'string',
        describe: 'Query blobs and limit received records to n (Does not work atm. Commons api client automaticaly gets all)',
        requiresArg: true
      },
      'getAll': {
        type: 'string',
        describe: 'Receive all records for query (1 or 0) (Does not work atm. Commons api client automaticaly gets all)',
        requiresArg: true
      },
    });
};
export const handler = async function (argv) {
  const client = await createApiClient(recordImportApiOptions, keycloakOptions);
  const {file} = argv;

  const query = getQuery(argv);
  console.log(`Query: ${JSON.stringify(query)}`);

  try {
    if (file) {
      const filePath = path.resolve(file);
      const writeStream = fs.createWriteStream(filePath, {flags: 'ax+', autoClose: false});
      await new Promise<void>((resolve, reject) => {
        const emitter = client.getBlobs(query);
        writeStream.on('error', reject);

        emitter
          .on('error', reject)
          .on('blobs', blobs => {
            const formatedBlobs = blobs.map(blob => format(blob));
            writeStream.write(JSON.stringify(formatedBlobs, undefined, 2));
          })
          .on('end', resolve);
      });

      await new Promise<void>((resolve, reject) => {
        writeStream.end(() => {
          console.log(`Query result written in file: ${filePath}`);
          writeStream.close(() => resolve()); // Explicitly close if autoClose: false
        });
      });

      return;
    }

    const count = await new Promise<number>((resolve, reject) => {
      var blobCount = 0;
      const emitter = client.getBlobs(query);
      emitter
        .on('error', reject)
        .on('end', () => resolve)
        .on('blobs', blobs => {
          // Use console.log coz logger starts print with date and type
          const formatedBlobs = blobs.map(blob => format(blob));
          blobCount += blobs.length;
          return console.log(JSON.stringify(formatedBlobs, undefined, 2));
        });
    });

    return console.log(`*** End of Query - found ${count} blobs ***`);
  } catch (err) {
    handleError(err);
  }
};

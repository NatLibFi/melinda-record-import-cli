import fs from 'fs';
import {createApiClient} from '@natlibfi/melinda-record-import-commons';
import {recordImportApiOptions, keycloakOptions} from '../../config.ts';
import {handleError} from '../utils.ts';

export const command = 'create <file> [options]';
export const desc = 'Create blob from file <file>';
export const builder = function (yargs) {
  return yargs
    .options({
      'p': {
        alias: 'profile',
        type: 'string',
        describe: 'Record import profile for blob',
        demandOption: true,
        requiresArg: true
      },
      't': {
        alias: 'contentType',
        type: 'string',
        describe: 'File content type',
        demandOption: true,
        requiresArg: true
      }
    });
};
export const handler = async function (argv) {
  const client = await createApiClient(recordImportApiOptions, keycloakOptions);
  console.log('Creating record from file %s', argv.file);
  const {file, profile, contentType} = argv;

  if (file === undefined && !fs.existsSync(file)) {
    throw new Error('File parametter missing for creating blob');
  }

  console.log('File access OK');
  console.log(`Profile parametter: ${profile !== undefined}`);
  console.log(`ContentType parametter: ${contentType !== undefined}`);

  try {
    const id = await client.createBlob({
      profile, type: contentType,
      blob: fs.createReadStream(file, {encoding: 'utf-8'}),
      duplex: 'half'
    });

    console.log(`Created a new blob ${id}`);
    return;
  } catch (err) {
    handleError(err);
  }
};
import fs from 'node:fs'
import {createApiClient} from '@natlibfi/melinda-record-import-commons';
import {recordImportApiOptions, keycloakOptions} from '../../config.ts';
import {handleError, format} from '../utils.ts';

export const command = 'read <id> [options]';
export const desc = 'Read blob by <id> [options]';
export const builder = function (yargs) {
  return yargs
    .options({
      'f': {
        alias: 'file',
        type: 'string',
        describe: 'Save blob to file',
        requiresArg: true
      },
    })
};
export const handler = async function (argv) {
  const client = await createApiClient(recordImportApiOptions, keycloakOptions);
  const {id, file} = argv;
  // console.log('Read record by id %s', id);
  try {
    const result = await client.getBlobMetadata({id});
    // Use console.log coz logger starts print with date and type
    if (result) {
      if (file) {
        if (fs.existsSync(file)) {
          throw new Error(`File '${file}' exists already!`)
        }

        return fs.writeFileSync(file, JSON.stringify(format(result), undefined, 2));
      }

      // eslint-disable-next-line no-console
      return console.log(JSON.stringify(format(result), undefined, 2));;
    }
    // eslint-disable-next-line no-console
    console.log('404 Blob not found!');
    return;
  } catch (err) {
    handleError(err);
  }
};
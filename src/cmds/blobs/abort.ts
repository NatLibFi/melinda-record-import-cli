import {createApiClient} from '@natlibfi/melinda-record-import-commons';
import {recordImportApiOptions, keycloakOptions} from '../../config.ts';
import {handleError} from '../utils.ts';

export const command = 'abort <id>';
export const desc = 'Abort blob by <id>';
export const builder = {};
export const handler = async function (argv) {
  const client = await createApiClient(recordImportApiOptions, keycloakOptions);
  const {id} = argv;
  console.log('Aborting blob by id %s', id);
  try {
    await client.setAborted({id});
    console.log(`Aborted processing of blob ${id}`);
  } catch (err) {
    handleError(err);
  }
};
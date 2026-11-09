import {createApiClient} from '@natlibfi/melinda-record-import-commons';
import {recordImportApiOptions, keycloakOptions} from '../../config.ts';
import {handleError} from '../utils.ts';

export const command = 'delete <id>';
export const desc = 'Delete blob by <id>';
export const builder = {};
export const handler = async function (argv) {
  const client = await createApiClient(recordImportApiOptions, keycloakOptions);
  const {id} = argv;
  console.log('Deleting blob by id %s', id);

  try {
    await client.deleteBlob({id});
    console.log(`Deleted blob ${id}`);
  } catch (err) {
    handleError(err);
  }
};
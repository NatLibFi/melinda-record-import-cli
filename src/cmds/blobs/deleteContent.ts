import {createApiClient} from '@natlibfi/melinda-record-import-commons';
import {recordImportApiOptions, keycloakOptions} from '../../config.ts';
import {handleError} from '../utils.ts';

export const command = 'deleteContent <id>';
export const desc = 'Delete blob content by <id>';
export const builder = {};
export const handler = async function (argv) {
  const client = await createApiClient(recordImportApiOptions, keycloakOptions);
  const {id} = argv;
  console.log('Deleting blob content by id %s', id);
  try {
    await client.deleteBlobContent({id});
    console.log(`Deleted content for blob ${id}`);
  } catch (err) {
    handleError(err);
  }
};
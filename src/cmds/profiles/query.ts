import {createApiClient} from '@natlibfi/melinda-record-import-commons';
import {recordImportApiOptions, keycloakOptions} from '../../config.ts';
import {handleError} from '../utils.ts';

export const command = 'query';
export const desc = 'Query profiles';
export const builder = {};
export const handler = async function (argv) {
  const client = await createApiClient(recordImportApiOptions, keycloakOptions);
  console.log('Reading profiles');

  try {
    const results = await client.queryProfiles();
    console.log(JSON.stringify(results, undefined, 2));
  } catch (err) {
    handleError(err);
  }
};

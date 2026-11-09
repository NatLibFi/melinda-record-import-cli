import {createApiClient} from '@natlibfi/melinda-record-import-commons';
import {recordImportApiOptions, keycloakOptions} from '../../config.ts';
import {handleError} from '../utils.ts';

export const command = 'read <profile>';
export const desc = 'Read profile by id <profile>';
export const builder = {};
export const handler = async function (argv) {
  const client = await createApiClient(recordImportApiOptions, keycloakOptions);
  const {profile} = argv;
  console.log('Reading profile %s ', profile);

  try {
    const result = await client.getProfile({id: profile});
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(result, undefined, 2));
  } catch (err) {
    handleError(err);
  }
};


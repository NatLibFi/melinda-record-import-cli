import {createApiClient} from '@natlibfi/melinda-record-import-commons';
import {recordImportApiOptions, keycloakOptions} from '../../config.ts';
import {handleError} from '../utils.ts';

export const command = 'delete <profile>';
export const desc = 'Delete profile by id <profile>';
export const builder = {};
export const handler = async function (argv) {
  const client = await createApiClient(recordImportApiOptions, keycloakOptions);
  const {profile} = argv;
  console.log('Deleting profile %s ', profile);

  try {
    await client.deleteProfile({id: profile});
    console.log(`Deleted profile ${profile}`);
  } catch (err) {
    handleError(err);
  }
};
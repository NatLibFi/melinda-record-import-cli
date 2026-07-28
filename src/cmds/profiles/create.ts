import {createApiClient} from '@natlibfi/melinda-record-import-commons';
import {recordImportApiOptions, keycloakOptions} from '../../config.ts';
import {handleError, readDataString} from '../utils.ts';

export const command = 'create <profile> <file>';
export const desc = 'Create profile from file <file>';
export const builder = {};
export const handler = async function (argv) {
  const client = await createApiClient(recordImportApiOptions, keycloakOptions);
  const {file, profile} = argv;
  console.log('Creating profile %s from file %s', profile, file);

  try {
    const data = await readDataString(file);
    const payload = JSON.stringify(data);
    await client.modifyProfile({id: profile, payload});
    console.log(`Created/updated profile ${profile}`);
  } catch (err) {
    handleError(err);
  }
};
import {readEnvironmentVariable} from '@natlibfi/melinda-backend-commons';
import {parseBoolean} from '@natlibfi/melinda-commons';
export const mongoUrl = readEnvironmentVariable('MONGO_URI', {defaultValue: false});

export const recordImportApiOptions = {
  recordImportApiUrl: readEnvironmentVariable('RECORD_IMPORT_API_URL', {defaultValue: false}),
  userAgent: readEnvironmentVariable('API_CLIENT_USER_AGENT', {defaultValue: '_RECORD-IMPORT-CLI'}),
  allowSelfSignedApiCert: readEnvironmentVariable('ALLOW_API_SELF_SIGNED', {defaultValue: false, format: parseBoolean})
};

export const keycloakOptions = {
  issuerBaseURL: readEnvironmentVariable('KEYCLOAK_ISSUER_BASE_URL', {defaultValue: ''}),
  serviceClientID: readEnvironmentVariable('KEYCLOAK_SERVICE_CLIENT_ID', {defaultValue: ''}),
  serviceClientSecret: readEnvironmentVariable('KEYCLOAK_SERVICE_CLIENT_SECRET', {defaultValue: ''})
};

/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* CLI for Melinda record batch import system
*
* Copyright (C) 2021 University Of Helsinki (The National Library Of Finland)
*
* This file is part of melinda-record-import-cli
*
* melinda-record-import-cli program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* melinda-record-import-cli is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this file.
*
*/

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
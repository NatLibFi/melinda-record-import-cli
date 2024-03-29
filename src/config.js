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

export const recordImportApiUrl = readEnvironmentVariable('API_URL');
export const recordImportApiUsername = readEnvironmentVariable('API_USERNAME');
export const recordImportApiPassword = readEnvironmentVariable('API_PASSWORD');
export const userAgent = readEnvironmentVariable('API_CLIENT_USER_AGENT', {defaultValue: 'Record import CLI'});

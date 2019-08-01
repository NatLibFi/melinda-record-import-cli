#!/usr/bin/env node
/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* CLI for Melinda record batch import system
*
* Copyright (C) 2019 University Of Helsinki (The National Library Of Finland)
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

import fs from 'fs';
import yargs from 'yargs';
import {getExtension as getMimeExtension} from 'mime';
import moment from 'moment';
import HttpStatus from 'http-status';
import {createApiClient, ApiError} from '@natlibfi/melinda-record-import-commons';
import {Utils} from '@natlibfi/melinda-commons';
import {
	API_URL, API_USERNAME, API_PASSWORD, API_CLIENT_USER_AGENT
} from './config';

run();

async function run() {
	const {handleInterrupt} = Utils;
	const client = createApiClient({url: API_URL, username: API_USERNAME, password: API_PASSWORD, userAgent: API_CLIENT_USER_AGENT});

	process
		.on('SIGINT', handleInterrupt)
		.on('unhandledRejection', handleInterrupt)
		.on('uncaughtException', handleInterrupt);

	yargs
		.wrap(yargs.terminalWidth())
		.scriptName('melinda-record-import')
		.demandCommand(1)
		.command('profiles', 'Operate on profiles', yargs => {
			yargs
				.demandCommand(1)
				.command({
					command: 'modify <id> [file]',
					desc: 'Create or update a profile',
					aliases: ['create', 'update'],
					handler: modifyProfile
				})
				.command({
					command: 'query',
					desc: 'Query profiles',
					handler: queryProfiles
				})
				.command({
					command: 'read <id>',
					desc: 'Read a profile',
					handler: readProfile
				})
				.command({
					command: 'delete <id>',
					desc: 'Delete a profile',
					handler: deleteProfile
				});
		})
		.command('blobs', 'Operate on blobs', yargs => {
			yargs
				.demandCommand(1)
				.command({
					command: 'create [file]',
					desc: 'Create a blob',
					builder: yargs => {
						yargs
							.option('profile', {
								alias: 'p',
								demandOption: true,
								requiresArg: true
							})
							.option('contentType', {
								alias: 't',
								demandOption: true,
								requiresArg: true
							});
					},
					handler: createBlob
				})
				.command({
					command: 'read <id>',
					desc: 'Read a blob',
					handler: readBlob
				})
				.command({
					command: 'delete <id>',
					desc: 'Delete a blob',
					handler: deleteBlob
				})
				.command({
					command: 'readContent <id> [file]',
					desc: 'Read blob content',
					handler: readBlobContent
				})
				.command({
					command: 'deleteContent <id>',
					desc: 'Delete blob content',
					handler: deleteBlobContent
				})
				.command({
					command: 'abort <id>',
					desc: 'Abort blob processing',
					handler: abortBlob
				})
				.command({
					command: 'query [options]',
					desc: 'Query blobs',
					builder: yargs => {
						yargs
							.option('filter', {
								alias: 'f',
								describe: 'Query filter',
								requiresArg: true
							});
					},
					handler: queryBlobs
				});
		})
		.demandCommand(1)
		.parse();

	async function modifyProfile({id, file}) {
		try {
			const payload = JSON.parse(await readData(file));
			await client.modifyProfile({id, payload});
			console.log(`Created/updated profile ${id}`);
		} catch (err) {
			handleError(err);
		}
	}

	async function queryProfiles() {
		try {
			const results = await client.queryProfiles();
			console.log(JSON.stringify(results, undefined, 2));
		} catch (err) {
			handleError(err);
		}
	}

	async function readProfile({id}) {
		try {
			const result = await client.getProfile({id});
			console.log(JSON.stringify(result, undefined, 2));
		} catch (err) {
			handleError(err);
		}
	}

	async function deleteProfile({id}) {
		try {
			await client.deleteProfile({id});
			console.log(`Deleted profile ${id}`);
		} catch (err) {
			handleError(err);
		}
	}

	async function createBlob({profile, contentType, file}) {
		try {
			const id = await client.createBlob({
				profile, type: contentType,
				blob: fs.existsSync(file) ? fs.createReadStream(file) : process.stdin
			});

			console.log(`Created a new blob ${id}`);
		} catch (err) {
			handleError(err);
		}
	}

	async function readBlob({id}) {
		try {
			const result = await client.getBlobMetadata({id});
			console.log(JSON.stringify(format(result), undefined, 2));
		} catch (err) {
			handleError(err);
		}

		function format(metadata) {
			metadata.modificationTime = moment(metadata.modificationTime).toISOString(true);
			metadata.creationTime = moment(metadata.creationTime).toISOString(true);
			return metadata;
		}
	}

	async function readBlobContent({id, file}) {
		try {
			const {contentType, readStream} = await client.getBlobContent({id});

			if (file) {
				const writeStream = fs.createWriteStream(file);

				await new Promise((resolve, reject) => {
					readStream
						.on('error', reject)
						.on('data', chunk => writeStream.write(chunk))
						.on('end', () => {
							writeStream.end();
							resolve();
						});
				});

				console.log(`Wrote blob content to file ${file}`);
			} else if (getMimeExtension(contentType) === 'bin' || !process.stdout.isTTY) {
				await new Promise((resolve, reject) => {
					readStream
						.setEncoding('utf8')
						.on('error', reject)
						.on('data', chunk => console.log(chunk))
						.on('end', resolve);
				});
			} else {
				console.error(`Content type ${contentType} seems to be binary. Refusing to print to console`);
				process.exit(1);
			}
		} catch (err) {
			handleError(err);
		}
	}

	async function deleteBlobContent({id}) {
		try {
			await client.deleteBlobContent({id});
			console.log(`Deleted content for blob ${id}`);
		} catch (err) {
			handleError(err);
		}
	}

	async function deleteBlob({id}) {
		try {
			await client.deleteBlob({id});
			console.log(`Deleted blob ${id}`);
		} catch (err) {
			handleError(err);
		}
	}

	async function abortBlob({id}) {
		try {
			await client.setAborted({id});
			console.log(`Aborted processing of blob ${id}`);
		} catch (err) {
			handleError(err);
		}
	}

	async function queryBlobs({filter}) {
		try {
			const query = getQuery();

			return new Promise((resolve, reject) => {
				const emitter = client.getBlobs(query);

				emitter
					.on('error', reject)
					.on('end', resolve)
					.on('blobs', blobs => {
						console.log(JSON.stringify(blobs, undefined, 2));
					});
			});
		} catch (err) {
			handleError(err);
		}

		function getQuery() {
			if (filter) {
				return (Array.isArray(filter) ? filter : [filter])
					.reduce((acc, arg) => {
						const [key, value] = arg.split(/=/); // eslint-disable-line no-div-regex

						// Multiple values to arrays
						if ([key] in acc) {
							return {...acc, [key]: [].concat(acc[key], value)};
						}

						return {...acc, [key]: value};
					}, {});
			}

			return {};
		}
	}

	function handleError(err) {
		if (err instanceof ApiError) {
			console.error(`API call failed: ${HttpStatus[`${err.status}_MESSAGE`]} (${err.status})`);
		} else {
			console.error(`Unexpected error: ${'stack' in err ? err.stack : err}`);
			process.exit(1);
		}
	}

	async function readData(filename) {
		if (filename) {
			return fs.readFileSync(filename, 'utf8');
		}

		return new Promise((resolve, reject) => {
			const chunks = [];

			process.stdin
				.setEncoding('utf8')
				.on('error', reject)
				.on('data', chunk => chunks.push(chunk))
				.on('close', () => resolve(chunks.join('')));
		});
	}
}

#!/usr/bin/env node

import fs from 'fs';
import yargs from 'yargs';
import {getExtension as getMimeExtension} from 'mime';
import moment from 'moment';
import HttpStatus from 'http-status';
import {Error as ApiError} from '@natlibfi/melinda-commons';
import {createApiClient, BLOB_STATE} from '@natlibfi/melinda-record-import-commons';
import {handleInterrupt, createLogger} from '@natlibfi/melinda-backend-commons';
import {
  recordImportApiUrl, recordImportApiUsername, recordImportApiPassword, userAgent
} from './config';

run();

function run() {
  const client = createApiClient({recordImportApiUrl, recordImportApiUsername, recordImportApiPassword, userAgent});
  const logger = createLogger();

  process
    .on('SIGINT', handleInterrupt)
    .on('unhandledRejection', handleInterrupt)
    .on('uncaughtException', handleInterrupt);

  yargs(process.argv.slice(2))
    .scriptName('melinda-record-import-cli')
    .wrap(yargs.terminalWidth())
    .epilog('Copyright (C) 2019-2022 University Of Helsinki (The National Library Of Finland)')
    .usage('Installed globally: $0 <environment> <operation> [options] and env variable info in README')
    .usage('Not installed: npx $0 <environment> <operation> [options] and env variable info in README')
    .usage('Build from source: node dist/index.js <environment> <operation> [options] and env variable info in README')
    .showHelpOnFail(true)
    .example([
      ['$ $0 profiles create <id> [file]'],
      ['$ $0 blobs create [file] -p <id> -t <file contentType>'],
      ['$ $0 blobs query -s transformed'],
      ['$ $0 blobs query -a 2022-05-12 -b 2022-05-13']
    ])
    .env('RECORD_IMPORT')
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
              .options({
                'p': {alias: 'profile', demandOption: true, requiresArg: true},
                't': {alias: 'contentType', demandOption: true, requiresArg: true}
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
          desc: `Query blobs:\n - States: ${Object.values(BLOB_STATE)}\n - Timestamp formats for options: YYYY-MM-DD or YYYY-MM-DDThh:mm:ss±hh`,
          builder: yargs => {
            yargs
              .options({
                's': {
                  alias: 'state',
                  describe: 'Query blobs by state',
                  requiresArg: true
                },
                'b': {
                  alias: 'createdBefore',
                  describe: 'Query blobs created before time',
                  requiresArg: true,
                  conflicts: ['d']
                },
                'a': {
                  alias: 'createdAfter',
                  describe: 'Query blobs created after time',
                  requiresArg: true,
                  conflicts: ['d']
                },
                'B': {
                  alias: 'modifiedBefore',
                  describe: 'Query blobs modified before time',
                  requiresArg: true,
                  conflicts: ['D']
                },
                'A': {
                  alias: 'modifiedAfter',
                  describe: 'Query blobs modified after time',
                  requiresArg: true,
                  conflicts: ['D']
                },
                'd': {
                  alias: 'createdDay',
                  describe: 'Query blobs created by day',
                  requiresArg: true,
                  conflicts: ['a', 'b']
                },
                'D': {
                  alias: 'modifiedDay',
                  describe: 'Query blobs modified by day',
                  requiresArg: true,
                  conflicts: ['A', 'B']
                }
              });
          },
          handler: queryBlobs
        });
    })
    .demandCommand(1)
    .parse();

  async function modifyProfile({id, file}) {
    if (file === undefined && !fs.accessSync(file, fs.constants.R_OK)) {
      throw new Error('File parametter missing for creating/modifying blob');
    }

    try {
      const payload = JSON.parse(await readData(file));
      await client.modifyProfile({id, payload});
      logger.info(`Created/updated profile ${id}`);
    } catch (err) {
      handleError(err);
    }
  }

  async function queryProfiles() {
    try {
      const results = await client.queryProfiles();
      logger.info(JSON.stringify(results, undefined, 2));
    } catch (err) {
      handleError(err);
    }
  }

  async function readProfile({id}) {
    try {
      const result = await client.getProfile({id});
      // Use console.log coz logger starts print with date and type
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(result, undefined, 2));
    } catch (err) {
      handleError(err);
    }
  }

  async function deleteProfile({id}) {
    try {
      await client.deleteProfile({id});
      logger.info(`Deleted profile ${id}`);
    } catch (err) {
      handleError(err);
    }
  }

  async function createBlob({profile, contentType, file}) {
    if (file === undefined && !fs.accessSync(file, fs.constants.R_OK)) {
      throw new Error('File parametter missing for creating blob');
    }

    try {
      const id = await client.createBlob({
        profile, type: contentType,
        blob: fs.accessSync(file, fs.constants.R_OK) ? fs.createReadStream(file, {encoding: 'UTF-8'}) : process.stdin
      });

      logger.info(`Created a new blob ${id}`);
    } catch (err) {
      handleError(err);
    }
  }

  async function readBlob({id}) {
    try {
      const result = await client.getBlobMetadata({id});
      // Use console.log coz logger starts print with date and type
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(format(result), undefined, 2));
    } catch (err) {
      handleError(err);
    }

    function format(metadata) {
      metadata.modificationTime = moment(metadata.modificationTime).toISOString(true); //eslint-disable-line functional/immutable-data
      metadata.creationTime = moment(metadata.creationTime).toISOString(true); //eslint-disable-line functional/immutable-data
      return metadata;
    }
  }

  async function readBlobContent({id, file}) {
    try {
      const {contentType, readStream} = await client.getBlobContent({id});
      const chunks = [];

      if (file) {
        const writeStream = fs.createWriteStream(file);

        await new Promise((resolve, reject) => {
          readStream
            .on('error', reject)
            .on('data', chunk => chunks.push(chunk)) // eslint-disable-line functional/immutable-data
            .on('end', () => {
              chunks.forEach(chunk => writeStream.write(chunk));
              writeStream.end();
              resolve();
            });
        });

        logger.info(`Wrote blob content to file ${file}`);
        return;
      }

      if (getMimeExtension(contentType) === 'bin' || !process.stdout.isTTY) {
        await new Promise((resolve, reject) => {
          readStream
            .setEncoding('utf8')
            .on('error', reject)
            .on('data', chunk => chunks.push(chunk)) // eslint-disable-line functional/immutable-data
            .on('end', () => {
              console.log(chunks.join('')); // eslint-disable-line no-console
              resolve();
            });
        });
        return;
      }

      logger.error(`Content type ${contentType} seems to be binary. Refusing to print to console`);
      throw new Error('Unexpected read content error');
    } catch (err) {
      handleError(err);
    }
  }

  async function deleteBlobContent({id}) {
    try {
      await client.deleteBlobContent({id});
      logger.info(`Deleted content for blob ${id}`);
    } catch (err) {
      handleError(err);
    }
  }

  async function deleteBlob({id}) {
    try {
      await client.deleteBlob({id});
      logger.info(`Deleted blob ${id}`);
    } catch (err) {
      handleError(err);
    }
  }

  async function abortBlob({id}) {
    try {
      await client.setAborted({id});
      logger.info(`Aborted processing of blob ${id}`);
    } catch (err) {
      handleError(err);
    }
  }

  function queryBlobs({state, createdBefore, createdAfter, modifiedBefore, modifiedAfter, createdDay, modifiedDay}) {
    const query = getQuery();
    try {

      return new Promise((resolve, reject) => {
        logger.info(`Query: ${JSON.stringify(query)}`);
        const emitter = client.getBlobs(query);

        emitter
          .on('error', reject)
          .on('end', resolve)
          .on('blobs', blobs => {
            // Use console.log coz logger starts print with date and type
            // eslint-disable-next-line no-console
            console.log(JSON.stringify(blobs, undefined, 2)); //eslint-disable-line no-console
          });
      });
    } catch (err) {
      handleError(err);
    }

    function getQuery() {
      const queriesArray = [
        {
          name: 'state',
          value: testBlobState(state) ? state : false
        },
        {
          name: 'creationTime',
          value: createTimeStampValue(testTimestamp(createdAfter, true), testTimestamp(createdBefore, true), testTimestamp(createdDay))
        },
        {
          name: 'modificationTime',
          value: createTimeStampValue(testTimestamp(modifiedAfter, true), testTimestamp(modifiedBefore, true), testTimestamp(modifiedDay))
        }
      ]
        .filter(param => param.value)
        .map(param => [param.name, param.value]);
      return Object.fromEntries(queriesArray);

      function createTimeStampValue(after, before, day) {
        if (!after && !before && !day) {
          return false;
        }

        if (day) {
          return [`${day}T00:00:00+01:00`, `${day}T23:59:59+01:00`];
        }

        if (!after && before) {
          return ['1990-01-01', before];
        }

        if (after && !before) {
          return [after, '3000-01-01'];
        }

        return [after, before];
      }

      function testTimestamp(timestamp, acceptHours = false) {
        if (timestamp === undefined) {
          return false;
        }

        if (acceptHours && (/^\d{4}-[01]{1}\d{1}-[0-3]{1}\d{1}T[0-2]{1}\d{1}:[0-6]{1}\d{1}:[0-6]{1}\d{1}[+-][0-2]{1}\d{1}/u).test(timestamp)) {
          return moment(timestamp).utc();
        }

        if ((/^\d{4}-[01]{1}\d{1}-[0-3]{1}\d{1}$/u).test(timestamp)) {
          return timestamp;
        }

        return false;
      }

      function testBlobState(state = false) {
        if (state) {
          return BLOB_STATE[state.toUpperCase()] !== undefined;
        }

        return false;
      }
    }
  }

  function handleError(err) {
    if (err instanceof ApiError) {
      return logger.error(`API call failed: ${HttpStatus[`${err.status}_MESSAGE`]} (${err.status})`);
    }

    throw new Error(`Unexpected handle error: ${'stack' in err ? err.stack : err}`);
  }

  function readData(filename) {
    if (filename) {
      return fs.readFileSync(filename, 'utf8');
    }

    return new Promise((resolve, reject) => {
      const chunks = [];

      process.stdin
        .setEncoding('utf8')
        .on('error', reject)
        .on('data', chunk => chunks.push(chunk)) //eslint-disable-line functional/immutable-data
        .on('close', () => resolve(chunks.join('')));
    });
  }
}

#!/usr/bin/env node

import yargs from 'yargs';
import {handleInterrupt} from '@natlibfi/melinda-backend-commons';

run();

async function run() {
  process
    .on('SIGINT', handleInterrupt)
    .on('unhandledRejection', handleInterrupt)
    .on('uncaughtException', handleInterrupt);

  await yargs(process.argv.slice(2))
    .commandDir('cmds')
    .scriptName('melinda-record-import-cli')
    .epilog('Copyright (C) 2019-2026 University Of Helsinki (The National Library Of Finland)')
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
    .version()
    .wrap(null)
    .env('RECORD_IMPORT')
    .demandCommand()
    .help()
    .parse();
}

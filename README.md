# CLI for Melinda record batch import system [![NPM Version](https://img.shields.io/npm/v/@natlibfi/melinda-record-import-cli.svg)](https://npmjs.org/package/@natlibfi/melinda-record-import-cli) [![Build Status](https://travis-ci.org/NatLibFi/melinda-record-import-cli.svg)](https://travis-ci.org/NatLibFi/melinda-record-import-cli) [![Test Coverage](https://codeclimate.com/github/NatLibFi/melinda-record-import-cli/badges/coverage.svg)](https://codeclimate.com/github/NatLibFi/melinda-record-import-cli/coverage)

CLI for Melinda record batch import system

# Usage
### NPM
```sh
$ npx @natlibfi/melinda-record-import-cli
```
### Docker
```sh
$ docker run --rm quay.io/natlibfi/melinda-record-import-cli
```

You can use stdin in the container as follows:
```sh
$ docker run \
  --rm \
  -i \
  --env-file .env \
  quay.io/natlibfi/melinda-record-import-cli profiles create foo
```

Or mount the the files directly:
```sh
$ docker run \
  --rm \
  --env-file .env 
  -v $PWD/profile.json:/data.json:ro \
  quay.io/natlibfi/melinda-record-import-cli profiles create foo /data.json
```
### Building the application
```sh
$ npm install
$ npm run build
$ node dist/index.js
```

## License and copyright

Copyright (c) 2019 **University Of Helsinki (The National Library Of Finland)**

This project's source code is licensed under the terms of **GNU Affero General Public License Version 3** or any later version.

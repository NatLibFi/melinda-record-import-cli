# CLI for Melinda record batch import system [![NPM Version](https://img.shields.io/npm/v/@natlibfi/melinda-record-import-cli.svg)](https://npmjs.org/package/@natlibfi/melinda-record-import-cli)

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
  -v /etc/localtime:/etc/localtime:ro \
  -i \
  --env-file .env \
  quay.io/natlibfi/melinda-record-import-cli profiles create foo
```

Or mount the the files directly:
```sh
$ docker run \
  --rm \
  -v /etc/localtime:/etc/localtime:ro \
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

Copyright (c) 2021-2023 **University Of Helsinki (The National Library Of Finland)**

This project's source code is licensed under the terms of **MIT** or any later version.

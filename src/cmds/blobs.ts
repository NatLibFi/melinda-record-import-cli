export const command = 'blobs <operation>';
export const desc = 'Operate on blobs';
export const builder = function (yargs) {
  return yargs.commandDir('blobs')
    .example([
      ['$ $0 blobs <operation> --help', 'Shows all <operation> options'],
      ['$ $0 blobs create example.json -p jsonProfile -t application/json', 'Creates new blob from file'],
      ['$ $0 blobs delete --help', 'Shows all blob delete options'],
      ['$ $0 blobs deleteContent --help', 'Shows all blob delete content options'],
      ['$ $0 blobs read --help', 'Shows all blob read options'],
      ['$ $0 blobs readContent --help', 'Shows all blob read content options'],
      ['$ $0 blobs query --help', 'Shows all blob query options']
    ]);
};
export const handler = function (_argv) { };
export const command = 'profiles <operation>';
export const desc = 'Operate on profiles';
export const builder = function (yargs) {
  return yargs.commandDir('profiles')
    .example([
      ['$ $0 profiles create --help', 'Shows all profiles create options'],
      ['$ $0 profiles create jsonProfile jsonProfile.json', 'Creates new profile from file'],
      ['$ $0 profiles delete --help', 'Shows all profiles delete options'],
      ['$ $0 profiles modify --help', 'Shows all profiles modify options'],
      ['$ $0 profiles query --help', 'Shows all profiles query options'],
      ['$ $0 profiles read --help', 'Shows all profiles read options']
    ]);
};
export const handler = function (_argv) { };
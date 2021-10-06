#! /usr/bin/env node --max-old-space-size=10240

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require(path.resolve(process.cwd(), 'env.config.json'));

process.on('SIGINT', () => process.exit(0));
process.on('exit', () => process.exit(0));
const args = process.argv.slice(2);

const scriptIndex = args.findIndex(
  x => config.commands.includes(x),
);
const envNames = Object.keys(config.env_name_mapping);
const chosenEnv = args.find((arg) => {
  return envNames.includes(arg.replace('--', ''));
}) || `--${config.default_env}`;

const script = scriptIndex === -1 ? args[0] : args[scriptIndex];

if (script) {
  const envName = config.env_name_mapping[chosenEnv.replace('--', '')];
  const envLocation = path.resolve(process.cwd(), `${config.env_configs_location}/.env.${envName}`);

  if (!fs.existsSync(envLocation)) {
    process.stdout.write('The specified env file isn\'t found!');
    process.exit(1);
  }
  const commandOpts = [
    '-f',
    envLocation,
    config.base_script,
    script,
    ...args.slice(1).filter(a => a !== chosenEnv),
  ];
  console.log('Running, please wait...');
  spawn('env-cmd', commandOpts, {
    cwd: process.cwd(),
    shell: true,
    stdio: 'inherit',
  });
} else {
  console.log('Unknown script "' + script + '".');
}


#!/usr/bin/env node
import * as meow from 'meow';
import { Builder, BuildOptions, ProgressEvent } from './';
import * as updateNotifier from 'update-notifier';
import * as ora from 'ora';
import * as util from 'util';
import * as fs from 'fs';
import * as path from 'path';

const pkg = require('../../package.json');
updateNotifier({ pkg }).notify();

const cli = meow(
  `
    Usage
      $ gcb [SOURCE] [--flags]

    Positional arguments

      SOURCE
        Path to the location of the sources to be deployed.  Will default to
        CWD if not otherwise specified.

    Flags

      --config=CONFIG
        The YAML or JSON file to use as the build configuration file.
        Defaults to 'cloudbuild.yaml' if not specified.

      --tag=TAG
        The tag to use with a "docker build" image creation.

    Examples
      $ gcb
      $ gcb --config ../perfect.yaml --tag ohai123
      $ gcp containers/web
`,
  {
    flags: {
      config: { type: 'string' },
      tag: { type: 'string' },
    }
  });

async function main() {
  if (cli.input.length > 1) {
    cli.showHelp();
    return;
  }

  const start = Date.now();
  const opts = cli.flags as BuildOptions;
  opts.sourcePath = cli.input.length > 0 ? cli.input[0] : process.cwd();
  if (!path.isAbsolute(opts.sourcePath)) {
    opts.sourcePath = path.join(process.cwd(), opts.sourcePath);
  }
  const hasIgnore = await hasIgnoreFile(opts.sourcePath);
  if (!hasIgnore) {
    await generateIgnoreFile(opts.sourcePath);
  }
  const spinny = ora('Initializing deployment...').start();
  const builder = new Builder(opts);
  builder
    .on(ProgressEvent.UPLOADING,
      () => {
        spinny.stopAndPersist(
          { symbol: '📦', text: 'Source code packaged.' });
        spinny.start('Uploading source...');
      })
    .on(ProgressEvent.BUILDING,
      () => {
        spinny.stopAndPersist(
          { symbol: '🛸', text: 'Source uploaded to cloud.' });
        spinny.start('Building container...');
      })
    .on(ProgressEvent.COMPLETE, () => {
      const seconds = (Date.now() - start) / 1000;
      spinny.stopAndPersist({
        symbol: '🚀',
        text: `Container built in ${seconds} seconds.`
      });
    });
  try {
    await builder.build();
  } catch (e) {
    console.error(e);
    spinny.fail(e.message);
    process.exit(1);
  }
}

async function generateIgnoreFile(targetDir: string) {
  console.log(`
    🤖 I generated a '.gcloudignore' file in the target directory.
       This file contains a list of glob patterns that should be ingored
       in your build. It works just like a .gitignore file 💜
  `);
  await new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, '../../src/.gcloudignore'))
      .pipe(fs.createWriteStream(path.join(targetDir, '.gcloudignore')))
      .on('error', reject)
      .on('close', resolve);
  });
}

/**
 * Checks to see if a given directory has a `.gcloudignore` file.
 * @param targetDir The directory with the sources to deploy.
 */
async function hasIgnoreFile(targetDir: string) {
  const ignoreFile = path.join(targetDir, '.gcloudignore');
  try {
    await util.promisify(fs.stat)(ignoreFile);
    return true;
  } catch (e) {
    return false;
  }
}

main().catch(console.error);

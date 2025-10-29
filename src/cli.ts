#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import util from 'node:util';
import chalk from 'chalk';
import meow from 'meow';
import ora from 'ora';
import updateNotifier, { type Package } from 'update-notifier';
import { Builder, type BuildOptions, ProgressEvent } from './index.js';

const package_ = JSON.parse(
	fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf8'),
) as Package;
updateNotifier({ pkg: package_ }).notify();

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
		importMeta: import.meta,
		flags: {
			config: { type: 'string' },
			tag: { type: 'string' },
		},
	},
);

async function main() {
	if (cli.input.length > 1) {
		cli.showHelp();
		return;
	}

	const start = Date.now();
	const options = cli.flags as BuildOptions;
	options.sourcePath = cli.input.length > 0 ? cli.input[0] : process.cwd();
	if (!path.isAbsolute(options.sourcePath)) {
		options.sourcePath = path.join(process.cwd(), options.sourcePath);
	}

	const hasIgnore = await hasIgnoreFile(options.sourcePath);
	if (!hasIgnore) {
		await generateIgnoreFile(options.sourcePath);
	}

	const spinny = ora('Initializing build...').start();
	const builder = new Builder(options);
	builder
		.on(ProgressEvent.CREATING_BUCKET, (bucket) => {
			spinny.stopAndPersist({
				symbol: '🌧',
				text: `Bucket '${bucket}' created.`,
			});
			spinny.start('Packing and uploading sources...');
		})
		.on(ProgressEvent.UPLOADING, () => {
			spinny.stopAndPersist({ symbol: '📦', text: 'Source code packaged.' });
			spinny.start('Uploading source...');
		})
		.on(ProgressEvent.BUILDING, () => {
			spinny.stopAndPersist({
				symbol: '🛸',
				text: 'Source uploaded to cloud.',
			});
			spinny.start('Building container...');
		})
		.on(ProgressEvent.LOG, (data) => {
			console.error(`\n\n${chalk.gray(data)}`);
		})
		.on(ProgressEvent.COMPLETE, () => {
			const seconds = (Date.now() - start) / 1000;
			spinny.stopAndPersist({
				symbol: '🚀',
				text: `Container built in ${seconds} seconds.`,
			});
		});
	try {
		await builder.build();
	} catch (error) {
		const error_ = error as Error;
		console.error(error_);
		spinny.fail(error_.message);

		process.exit(1);
	}
}

async function generateIgnoreFile(targetDirectory: string) {
	console.log(`
    🤖 I generated a '.gcloudignore' file in the target directory.
       This file contains a list of glob patterns that should be ingored
       in your build. It works just like a .gitignore file 💜
  `);
	await new Promise((resolve, reject) => {
		fs.createReadStream(path.join(__dirname, '../../src/.gcloudignore'))
			.pipe(fs.createWriteStream(path.join(targetDirectory, '.gcloudignore')))
			.on('error', (err) => reject(err))
			.on('close', () => resolve(undefined));
	});
}

/**
 * Checks to see if a given directory has a `.gcloudignore` file.
 * @param targetDir The directory with the sources to deploy.
 */
async function hasIgnoreFile(targetDirectory: string) {
	const ignoreFile = path.join(targetDirectory, '.gcloudignore');
	try {
		await util.promisify(fs.stat)(ignoreFile);
		return true;
	} catch {
		return false;
	}
}

await main();

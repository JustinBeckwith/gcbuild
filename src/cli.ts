#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import util from 'node:util';
import chalk from 'chalk';
import meow from 'meow';
import ora from 'ora';
import updateNotifier, { type Package } from 'update-notifier';
import {
	type BuildError,
	Builder,
	type BuildOptions,
	ProgressEvent,
} from './index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

      --substitutions=KEY=VALUE
        Substitution variables to pass to the build. Can be specified multiple times.
        Example: --substitutions=_ENV=prod --substitutions=_VERSION=1.2.3

      --timeout=DURATION
        Amount of time to wait for the build to complete.
        Example: --timeout=20m or --timeout=1200s

      --machine-type=TYPE
        Compute Engine machine type on which to run the build.
        Example: --machine-type=E2_HIGHCPU_8

    Examples
      $ gcb
      $ gcb --config ../perfect.yaml --tag ohai123
      $ gcb containers/web
      $ gcb --substitutions=_ENV=prod --timeout=20m
      $ gcb --machine-type=E2_HIGHCPU_8
`,
	{
		importMeta: import.meta,
		flags: {
			config: { type: 'string' },
			tag: { type: 'string' },
			substitutions: { type: 'string', isMultiple: true },
			timeout: { type: 'string' },
			machineType: { type: 'string' },
		},
	},
);

export async function main(options?: {
	input?: string[];
	flags?: Record<string, unknown>;
	showHelp?: () => void;
}) {
	const actualOptions = options || {
		input: cli.input,
		flags: cli.flags,
		showHelp: () => cli.showHelp(),
	};
	const input = actualOptions.input || [];
	const flags = actualOptions.flags || {};

	if (input.length > 1) {
		actualOptions.showHelp?.();
		return;
	}

	const start = Date.now();
	const buildOptions = flags as BuildOptions;
	buildOptions.sourcePath = input.length > 0 ? input[0] : process.cwd();
	if (!path.isAbsolute(buildOptions.sourcePath)) {
		buildOptions.sourcePath = path.join(process.cwd(), buildOptions.sourcePath);
	}

	// Parse substitutions from KEY=VALUE format
	if (flags.substitutions) {
		const substitutionsArray = Array.isArray(flags.substitutions)
			? flags.substitutions
			: [flags.substitutions];
		buildOptions.substitutions = {};
		for (const sub of substitutionsArray as string[]) {
			const [key, value] = sub.split('=');
			if (key && value) {
				buildOptions.substitutions[key] = value;
			}
		}
	}

	const hasIgnore = await hasIgnoreFile(buildOptions.sourcePath);
	if (!hasIgnore) {
		await generateIgnoreFile(buildOptions.sourcePath);
	}

	const spinny = ora('Initializing build...').start();
	const builder = new Builder(buildOptions);
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
		const error_ = error as BuildError;
		spinny.fail(error_.message);

		// Display detailed error information
		if (error_.buildId) {
			console.error(chalk.red(`Build ID: ${error_.buildId}`));
		}
		if (error_.status) {
			console.error(chalk.red(`Status: ${error_.status}`));
		}
		if (error_.failedStep) {
			console.error(chalk.red(`Failed step: ${error_.failedStep}`));
		}
		if (error_.suggestion) {
			console.error(chalk.yellow(`\n💡 Suggestion: ${error_.suggestion}`));
		}
		if (error_.log) {
			console.error(chalk.gray(`\n📋 Build logs:\n${error_.log}`));
		}

		process.exit(1);
	}
}

export async function generateIgnoreFile(targetDirectory: string) {
	console.log(`
    🤖 I generated a '.gcloudignore' file in the target directory.
       This file contains a list of glob patterns that should be ingored
       in your build. It works just like a .gitignore file 💜
  `);
	await new Promise((resolve, reject) => {
		// Try multiple paths to find the source .gcloudignore file
		// In development: __dirname is .../build/src, so ../../src/.gcloudignore points to source
		// In production (npm): the .gcloudignore is packaged at ../src/.gcloudignore relative to build/src
		const possiblePaths = [
			path.resolve(__dirname, '../../src/.gcloudignore'),
			path.resolve(__dirname, '../src/.gcloudignore'),
			path.resolve(__dirname, '.gcloudignore'),
		];

		let sourceIgnoreFile = possiblePaths[0];
		for (const testPath of possiblePaths) {
			if (fs.existsSync(testPath)) {
				sourceIgnoreFile = testPath;
				break;
			}
		}

		fs.createReadStream(sourceIgnoreFile)
			.pipe(fs.createWriteStream(path.join(targetDirectory, '.gcloudignore')))
			.on('error', (err) => reject(err))
			.on('close', () => resolve(undefined));
	});
}

/**
 * Checks to see if a given directory has a `.gcloudignore` file.
 * @param targetDir The directory with the sources to deploy.
 */
export async function hasIgnoreFile(targetDirectory: string) {
	const ignoreFile = path.join(targetDirectory, '.gcloudignore');
	try {
		await util.promisify(fs.stat)(ignoreFile);
		return true;
	} catch {
		return false;
	}
}

// Only run main if this file is being executed directly (not imported)
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
	await main();
}

import fs from 'node:fs';
import path from 'node:path';
import {type cloudbuild_v1} from 'googleapis';
import yaml from 'js-yaml';

export type GetConfigOptions = {
	configPath?: string;
	sourcePath: string;
	projectId: string;
	tag?: string;
};

export async function getConfig(options: GetConfigOptions) {
	// If no config path was provided, work through the following set of default
	// paths looking for some kind of config:
	// 1. cloudbuild.yaml
	// 2. cloudbuild.json
	// 3. Dockerfile
	if (!options.configPath) {
		const files = ['cloudbuild.yaml', 'cloudbuild.json', 'Dockerfile'];
		for (const file of files) {
			const fullpath = path.join(options.sourcePath, file);
			// eslint-disable-next-line no-await-in-loop
			const fileExists = await exists(fullpath);
			if (fileExists) {
				options.configPath = fullpath;
				break;
			}
		}
	}

	if (!options.configPath) {
		throw new Error(`
      Unable to find configuration file. Please provide a cloudbuild.yaml,
      cloudbuild.json, or Dockerfile in the source directory.`);
	}

	let config: cloudbuild_v1.Schema$Build;
	if (path.basename(options.configPath) === 'Dockerfile') {
		if (!options.tag) {
			options.tag = path.basename(options.sourcePath);
		}

		config = {
			steps: [
				{
					name: 'gcr.io/cloud-builders/docker',
					args: [
						'build',
						'-t',
						`gcr.io/${options.projectId}/${options.tag}`,
						'.',
					],
				},
			],
			images: [`gcr.io/${options.projectId}/${options.tag}`],
		};
	} else {
		const configFileContents = await fs.promises.readFile(
			options.configPath,
			'utf8',
		);
		const ext = path.extname(options.configPath);
		switch (ext) {
			case '.json': {
				config = JSON.parse(configFileContents) as cloudbuild_v1.Schema$Build;
				break;
			}

			case '.yaml': {
				config = (await yaml.load(
					configFileContents,
				)) as cloudbuild_v1.Schema$Build;
				break;
			}

			default: {
				throw new Error(
					`The ${ext} extension is not supported.  Please pass yaml or json.`,
				);
			}
		}
	}

	return config;
}

/**
 * Check if a file exists async
 * @param file path to the file to check
 */
async function exists(file: string) {
	try {
		await fs.promises.access(file, fs.constants.F_OK);
		return true;
	} catch {
		return false;
	}
}

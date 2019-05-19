import * as fs from 'fs';
import { cloudbuild_v1 } from 'googleapis';
import * as path from 'path';
import { promisify } from 'util';
import * as util from 'util';

import yaml = require('js-yaml');

const readFile = promisify(fs.readFile);
const access = promisify(fs.access);

export interface GetConfigOptions {
  configPath?: string;
  sourcePath: string;
  projectId: string;
  tag?: string;
}

export async function getConfig(opts: GetConfigOptions) {
  // If no config path was provided, work through the following set of default
  // paths looking for some kind of config:
  // 1. cloudbuild.yaml
  // 2. cloudbuild.json
  // 3. Dockerfile
  if (!opts.configPath) {
    const files = ['cloudbuild.yaml', 'cloudbuild.json', 'Dockerfile'];
    for (const file of files) {
      const fullpath = path.join(opts.sourcePath, file);
      const fileExists = await exists(fullpath);
      if (fileExists) {
        opts.configPath = fullpath;
        break;
      }
    }
  }

  if (!opts.configPath) {
    throw new Error(`
      Unable to find configuration file. Please provide a cloudbuild.yaml,
      cloudbuild.json, or Dockerfile in the source directory.`);
  }

  let config: cloudbuild_v1.Schema$Build;
  if (path.basename(opts.configPath) === 'Dockerfile') {
    if (!opts.tag) {
      opts.tag = path.basename(opts.sourcePath);
    }
    config = {
      steps: [
        {
          name: 'gcr.io/cloud-builders/docker',
          args: ['build', '-t', `gcr.io/${opts.projectId}/${opts.tag}`, '.'],
        },
      ],
      images: [`gcr.io/${opts.projectId}/${opts.tag}`],
    };
  } else {
    const configFileContents = await readFile(opts.configPath, 'utf8');
    const ext = path.extname(opts.configPath);
    switch (ext) {
      case '.json':
        config = JSON.parse(configFileContents);
        break;
      case '.yaml':
        config = await yaml.safeLoad(configFileContents);
        break;
      default:
        throw new Error(
          `The ${ext} extension is not supported.  Please pass yaml or json.`
        );
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
    await access(file, fs.constants.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}

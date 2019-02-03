import * as fs from 'fs';
import {cloudbuild_v1} from 'googleapis';
import * as path from 'path';
import * as util from 'util';

import yaml = require('js-yaml');

const readFile = util.promisify(fs.readFile);

export async function getConfig(configPath: string) {
  const configFileContents = await readFile(configPath, 'utf8');
  const ext = path.extname(configPath);
  let config: cloudbuild_v1.Schema$Build;
  switch (ext) {
    case '.json':
      config = JSON.parse(configFileContents);
      break;
    case '.yaml':
      config = await yaml.safeLoad(configFileContents);
      break;
    default:
      throw new Error(
          `The ${ext} extension is not supported.  Please pass yaml or json.`);
  }
  return config;
}

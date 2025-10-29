# gcbuild

> A super simple CLI and API for using Google Cloud Build.

[![NPM Version](https://img.shields.io/npm/v/gcbuild.svg)](https://npmjs.org/package/gcbuild)
[![CI](https://github.com/JustinBeckwith/gcbuild/actions/workflows/ci.yaml/badge.svg)](https://github.com/JustinBeckwith/gcbuild/actions/workflows/ci.yaml)
[![codecov](https://codecov.io/gh/JustinBeckwith/gcbuild/branch/main/graph/badge.svg)](https://codecov.io/gh/JustinBeckwith/gcbuild)
[![Checked with Biome](https://img.shields.io/badge/Checked_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev)
[![Release Please](https://github.com/JustinBeckwith/gcbuild/actions/workflows/release.yaml/badge.svg)](https://github.com/JustinBeckwith/gcbuild/actions/workflows/release.yaml)

![gcbuild](https://raw.githubusercontent.com/JustinBeckwith/gcbuild/main/site/gcbuild.webp)

## Installation

```sh
npm install gcbuild
```

## Command Line

`gcb` is a convenient way to submit jobs to Google Cloud Build.  To use as a command line application:

```sh
npm install --save-dev gcbuild
```

Then from your `package.json`, it's super easy to add a deploy script:

```json
"scripts": {
  "deploy": "gcb"
}
```

### Positional arguments

#### SOURCE

Location of the sources to be deployed.  If not specified, assumes the current working directory.

### Flags

#### --config

The YAML or JSON file to use as the build configuration file. Defaults to 'cloudbuild.yaml' if not specified.

#### --tag

The tag to use with a "docker build" image creation.

#### --substitutions

Substitution variables to pass to the build. Can be specified multiple times. These are available in the build config as `${_VARIABLE_NAME}`.

#### --timeout

Amount of time to wait for the build to complete. Examples: `20m`, `1200s`, `1h`

#### --machine-type

Compute Engine machine type on which to run the build. Examples: `E2_HIGHCPU_8`, `N1_HIGHCPU_32`

### Examples

```sh
# Create an image for the current working directory.
$ gcb

# If there's a Dockerfile in the CWD, I can also specify a tag
$ gcb --tag my-image-name

# Use a build file not named `cloudbuild.yaml`
$ gcb --config suchbuild.json

# Perform a build from another location on disk
$ gcb ~/Code/verydocker

# Use substitutions for template variables
$ gcb --substitutions=_ENV=prod --substitutions=_VERSION=1.2.3

# Set a custom timeout and machine type
$ gcb --timeout=20m --machine-type=E2_HIGHCPU_8
```

## API

You can also use this as a regular old API.

### Building

```js
import {build} from 'gcbuild';

const result = await build({
  sourcePath: '/path/to/source',
  tag: 'my-image',
  substitutions: {
    _ENV: 'production',
    _VERSION: '1.2.3'
  },
  timeout: '20m',
  machineType: 'E2_HIGHCPU_8'
});
console.log('Build completed:', result.metadata.build.id);
```

### Build Management

You can also list, retrieve, and cancel builds:

```js
import {listBuilds, getBuild, cancelBuild} from 'gcbuild';

// List recent builds
const builds = await listBuilds({
  limit: 10,
  filter: 'status=WORKING'
});
console.log('Recent builds:', builds);

// Get a specific build
const build = await getBuild('build-id-123');
console.log('Build status:', build.status);

// Cancel a running build
const cancelled = await cancelBuild('build-id-123');
console.log('Cancelled:', cancelled.id);
```

### Options

All methods accept the following authentication options:

- `projectId`: GCP project ID
- `keyFilename`: Path to service account key file
- Additional [GoogleAuthOptions](https://github.com/googleapis/google-auth-library-nodejs)

Build-specific options for `build()`:

- `sourcePath`: Path to the source code directory (default: CWD)
- `configPath`: Path to cloudbuild.yaml/json file
- `tag`: Docker image tag
- `substitutions`: Object with substitution variables for the build
- `timeout`: Build timeout (e.g., '20m', '1200s', '1h')
- `machineType`: Compute Engine machine type (e.g., 'E2_HIGHCPU_8')

### Error Handling

The library throws `BuildError` exceptions with detailed information:

```js
import {build, BuildError} from 'gcbuild';

try {
  await build({ sourcePath: './app' });
} catch (error) {
  if (error instanceof BuildError) {
    console.error('Build ID:', error.buildId);
    console.error('Status:', error.status);
    console.error('Failed step:', error.failedStep);
    console.error('Suggestion:', error.suggestion);
    console.error('Logs:', error.log);
  }
}
```

## Authentication

This library uses [google-auth-library](https://www.npmjs.com/package/google-auth-library) under the hood to provide authentication.  That means you can authenticate a few ways.

### Using a service account

One of the reasons this library exists is to provide a nodejs native deployment in environments where you don't want to have the Cloud SDK installed.

For this method, you'll need to [create a service account](https://cloud.google.com/docs/authentication/getting-started), and download a key.

1. In the GCP Console, go to the [Create service account key](https://console.cloud.google.com/apis/credentials/serviceaccountkey?_ga=2.44822625.-475179053.1491320180) page.
1. From the Service account drop-down list, select New service account.
1. In the Service account name field, enter a name.
1. From the Role drop-down list, select Project > Owner.
1. Click Create. A JSON file that contains your key downloads to your computer.

```sh
export GOOGLE_APPLICATION_CREDENTIALS="./keys.json"
gcb .
```

#### Using application default credentials

If you plan on only using this from your machine, and you have the Google Cloud SDK installed, you can just use application default credentials like this:

```sh
gcloud auth login
gcloud auth application-default login
gcloud config set project 'YOUR-AWESOME-PROJECT'
gcb .
```

## License

[MIT](LICENSE)

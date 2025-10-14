# gcbuild
> A super simple CLI and API for using Google Cloud Build.

[![NPM Version](https://img.shields.io/npm/v/gcbuild.svg)](https://npmjs.org/package/gcbuild)
[![CI](https://github.com/JustinBeckwith/gcbuild/actions/workflows/ci.yaml/badge.svg)](https://github.com/JustinBeckwith/gcbuild/actions/workflows/ci.yaml)
[![codecov](https://codecov.io/gh/JustinBeckwith/gcbuild/branch/main/graph/badge.svg)](https://codecov.io/gh/JustinBeckwith/gcbuild)
[![Checked with Biome](https://img.shields.io/badge/Checked_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev)
[![Release Please](https://github.com/JustinBeckwith/gcbuild/actions/workflows/release.yaml/badge.svg)](https://github.com/JustinBeckwith/gcbuild/actions/workflows/release.yaml)

## Installation
```sh
$ npm install gcbuild
```

## Command Line
`gcb` is a convenient way to submit jobs to Google Cloud Build.  To use as a command line application:

```sh
$ npm install --save-dev gcbuild
```

Then from your `package.json`, it's super easy to add a deploy script:

```json
"scripts": {
  "deploy": "gcb"
}
```

### Positional arguments

##### SOURCE
Location of the sources to be deployed.  If not specified, assumes the current working directory.

### Flags

##### --config
The YAML or JSON file to use as the build configuration file. Defaults to 'cloudbuild.yaml' if not specified.

##### --tag
The tag to use with a "docker build" image creation.

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
```

## API
You can also use this as a regular old API.

```js
import {build} from 'gcb';

async function main() {
  await build({
    source: '/path/to/source',
    ....
  });
}
main().catch(console.error);
```

## Authentication
This library uses [google-auth-library](https://www.npmjs.com/package/google-auth-library) under the hood to provide authentication.  That means you can authenticate a few ways.

#### Using a service account
One of the reasons this library exists is to provide a nodejs native deployment in environments where you don't want to have the Cloud SDK installed.

For this method, you'll need to [create a service account](https://cloud.google.com/docs/authentication/getting-started), and download a key.

1. In the GCP Console, go to the [Create service account key](https://console.cloud.google.com/apis/credentials/serviceaccountkey?_ga=2.44822625.-475179053.1491320180) page.
1. From the Service account drop-down list, select New service account.
1. In the Service account name field, enter a name.
1. From the Role drop-down list, select Project > Owner.
1. Click Create. A JSON file that contains your key downloads to your computer.

```sh
$ export GOOGLE_APPLICATION_CREDENTIALS="./keys.json"
$ gcb .
```

#### Using application default credentials
If you plan on only using this from your machine, and you have the Google Cloud SDK installed, you can just use application default credentials like this:

```sh
$ gcloud auth login
$ gcloud auth application-default login
$ gcloud config set project 'YOUR-AWESOME-PROJECT'
$ gcb .
```

## License
[MIT](LICENSE)

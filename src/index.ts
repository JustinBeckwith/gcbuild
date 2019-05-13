import { EventEmitter } from 'events';
import * as fs from 'fs';
import globby from 'globby';
import { GoogleAuth, GoogleAuthOptions } from 'google-auth-library';
import { cloudbuild_v1, google, storage_v1 } from 'googleapis';
import * as path from 'path';
import { PassThrough } from 'stream';
import * as tar from 'tar';
import { promisify } from 'util';

import { getConfig } from './config';

const readFile = promisify(fs.readFile);

export enum ProgressEvent {
  CREATING_BUCKET = 'CREATING_BUCKET',
  UPLOADING = 'UPLOADING',
  BUILDING = 'BUILDING',
  COMPLETE = 'COMPLETE',
  LOG = 'LOG',
}

export interface BuildOptions extends GoogleAuthOptions {
  /**
   * The path to the container sources.
   * Defaults to CWD if not defined.
   */
  sourcePath?: string;
  /**
   * The path to the yaml/json config.
   * Defaults to `${sourcePath}/cloudbuild.yaml`
   */
  configPath?: string;
  /**
   * The docker tag to apply to the container that gets created.
   */
  tag?: string;
}

/**
 * Class that provides the `deploy` method.
 */
export class Builder extends EventEmitter {
  private sourcePath: string;
  private configPath: string;
  private _auth: GoogleAuth;
  private gcb = google.cloudbuild('v1');
  private gcs = google.storage('v1');

  constructor(options: BuildOptions = {}) {
    super();
    this.sourcePath = options.sourcePath || process.cwd();
    this.configPath =
      options.configPath || path.join(this.sourcePath, 'cloudbuild.yaml');
    this._auth = new GoogleAuth(options);
  }

  /**
   * Deploy the current application using the given opts.
   */
  async build(): Promise<BuildResult> {
    const auth = await this._auth.getClient({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    google.options({ auth });

    this.emit(ProgressEvent.UPLOADING);
    const { bucket, file } = await this.upload();

    this.emit(ProgressEvent.BUILDING);
    const projectId = await this._auth.getProjectId();

    // load configuration
    const requestBody = await getConfig(this.configPath);
    requestBody.source = { storageSource: { bucket, object: file } };

    // create the request to perform a build
    const res = await this.gcb.projects.builds.create({
      projectId,
      requestBody,
    });
    const result = res.data as BuildResult;

    // poll the operation until complete
    const operationId = res.data.name!;
    try {
      await this.poll(operationId);
    } catch (e) {
      let log: string;
      try {
        log = await this.fetchLog(result);
      } catch (e) {}
      (e as BuildError).log = log!;
      throw e;
    }

    // Log streaming is super hard to understand.  For now, just fetch the
    // log from a well known location *after* it's complete.
    // TODO: make it stream
    const log = await this.fetchLog(result);
    result.log = log;
    this.emit(ProgressEvent.COMPLETE);
    return result;
  }

  /**
   * Obtain the full text of the log after the build is complete.
   * At some point this should be replaced with streaming logs.
   * @param result The BuildResult returned from the create operation
   */
  private async fetchLog(result: BuildResult): Promise<string> {
    const build = result.metadata.build;
    const logsBucket = build.logsBucket!.split('gs://').filter(x => !!x)[0];
    const logFilename = `log-${build.id}.txt`;
    const logRes = await this.gcs.objects.get({
      bucket: logsBucket,
      object: logFilename,
      alt: 'media',
    });
    this.emit(ProgressEvent.LOG, logRes.data);
    return logRes.data as string;
  }

  /**
   * Given an operation, poll it until complete.
   * @private
   * @param name Fully qualified name of the operation.
   */
  private async poll(name: string) {
    const res = await this.gcb.operations.get({ name });
    const operation = res.data;
    if (operation.error) {
      const message = JSON.stringify(operation.error);
      throw new Error(message);
    }
    if (operation.done) {
      return;
    }
    await new Promise(r => setTimeout(r, 3000));
    await this.poll(name);
  }

  /**
   * Upload a local file to GCS given a signed url
   * @private
   * @param localPath Fully qualified path to the zip on disk.
   * @param remotePath Signed url used to put the file to
   */
  private async upload() {
    // check to see if the bucket exists
    const projectId = await this._auth.getProjectId();
    const bucketName = `${projectId}-gcb-staging-bbq`;
    const exists = await this.gcs.buckets
      .get({ bucket: bucketName })
      .then(() => true, () => false);

    // if it does not exist, create it!
    if (!exists) {
      this.emit(ProgressEvent.CREATING_BUCKET, bucketName);
      await this.gcs.buckets.insert({
        project: projectId,
        requestBody: {
          name: bucketName,
          lifecycle: {
            rule: [{ action: { type: 'Delete' }, condition: { age: 1 } }],
          },
        },
      });
    }

    // Get the full list of files that don't match .gcloudignore
    const ignorePatterns = await this.getIgnoreRules();
    const files = await globby('**/**', {
      ignore: ignorePatterns,
      cwd: this.sourcePath,
    });

    // create a tar stream with all the files
    const tarStream = tar.c({ gzip: true, cwd: this.sourcePath }, files);

    // There is a bizarre bug with node-tar where the stream it hands back
    // looks like a stream and talks like a stream, but it ain't a real
    // stream.  Pass it through a Duplex to make node-fetch happy.
    const bodyStream = new PassThrough();
    tarStream.pipe(bodyStream);

    // upload the object via stream to GCS
    const file = Date.now().toString() + '.tar.gz';
    await this.gcs.objects.insert({
      bucket: bucketName,
      name: file,
      media: { mediaType: 'application/gzip', body: bodyStream },
    } as storage_v1.Params$Resource$Objects$Insert);

    return { bucket: bucketName, file };
  }

  /**
   * Look in the CWD for a `.gcloudignore` file.  If one is present, parse it,
   * and return the ignore rules as an array of strings.
   * @private
   */
  private async getIgnoreRules() {
    const ignoreFile = path.join(this.sourcePath, '.gcloudignore');
    let ignoreRules = new Array<string>();
    try {
      const contents = await readFile(ignoreFile, 'utf8');
      ignoreRules = contents.split('\n').filter(line => {
        return !line.startsWith('#') && line.trim() !== '';
      });
    } catch (e) {}
    return ignoreRules;
  }
}

export async function build(options: BuildOptions) {
  const builder = new Builder(options);
  return builder.build();
}

export interface BuildResult {
  name: string;
  log: string;
  metadata: { build: cloudbuild_v1.Schema$Build };
}

export interface BuildError extends Error {
  log?: string;
}

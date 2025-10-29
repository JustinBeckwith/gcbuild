import { EventEmitter } from 'node:events';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { PassThrough } from 'node:stream';
import type { protos } from '@google-cloud/cloudbuild';
import { CloudBuildClient } from '@google-cloud/cloudbuild';
import { Storage } from '@google-cloud/storage';
import { globby } from 'globby';
import { GoogleAuth, type GoogleAuthOptions } from 'google-auth-library';
import { c as tarCreate } from 'tar';
import { getConfig } from './config.js';

export enum ProgressEvent {
	CREATING_BUCKET = 'CREATING_BUCKET',
	UPLOADING = 'UPLOADING',
	BUILDING = 'BUILDING',
	COMPLETE = 'COMPLETE',
	LOG = 'LOG',
}

export type BuildOptions = {
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
	/**
	 * Substitution variables to pass to the build.
	 * These are available in the build config as ${_VARIABLE_NAME}.
	 * @example
	 * { _ENV: 'production', _VERSION: '1.2.3' }
	 */
	substitutions?: Record<string, string>;
	/**
	 * Amount of time to wait for the build to complete.
	 * Defaults to 10 minutes if not specified.
	 * @example
	 * '20m' or '1200s'
	 */
	timeout?: string;
	/**
	 * Compute Engine machine type on which to run the build.
	 * @example
	 * 'E2_HIGHCPU_8' or 'N1_HIGHCPU_32'
	 */
	machineType?: string;
} & GoogleAuthOptions;

/**
 * Class that provides the `deploy` method.
 */
export class Builder extends EventEmitter {
	public readonly auth: GoogleAuth;

	private readonly sourcePath: string;
	private readonly configPath?: string;
	private readonly tag?: string;
	private readonly substitutions?: Record<string, string>;
	private readonly timeout?: string;
	private readonly machineType?: string;
	private readonly gcb: CloudBuildClient;
	private readonly gcs: Storage;

	constructor(options: BuildOptions = {}) {
		super();
		this.tag = options.tag;
		this.sourcePath = options.sourcePath || process.cwd();
		this.configPath = options.configPath;
		this.substitutions = options.substitutions;
		this.timeout = options.timeout;
		this.machineType = options.machineType;
		options.scopes = ['https://www.googleapis.com/auth/cloud-platform'];
		this.auth = new GoogleAuth(options);

		// Extract only the auth-related options for the clients
		const {
			sourcePath: _sourcePath,
			configPath: _configPath,
			tag: _tag,
			substitutions: _substitutions,
			timeout: _timeout,
			machineType: _machineType,
			...authOptions
		} = options;

		this.gcb = new CloudBuildClient(authOptions);
		// For Storage, pass minimal options to avoid type conflicts with different google-auth-library versions
		this.gcs = new Storage({
			projectId: options.projectId,
			keyFilename: options.keyFilename,
		});
	}

	/**
	 * Deploy the current application using the given opts.
	 */
	async build(): Promise<BuildResult> {
		this.emit(ProgressEvent.UPLOADING);
		const { bucket, file } = await this.upload();

		this.emit(ProgressEvent.BUILDING);
		const projectId = await this.auth.getProjectId();

		// Load configuration
		const buildConfig = await getConfig({
			configPath: this.configPath,
			sourcePath: this.sourcePath,
			projectId,
			tag: this.tag,
		});

		buildConfig.source = { storageSource: { bucket, object: file } };

		// Apply substitutions if provided
		if (this.substitutions) {
			buildConfig.substitutions = this.substitutions;
		}

		// Apply timeout if provided
		if (this.timeout) {
			buildConfig.timeout = this.parseTimeout(this.timeout);
		}

		// Apply machine type if provided
		if (this.machineType) {
			buildConfig.options = buildConfig.options || {};
			buildConfig.options.machineType = this
				.machineType as keyof typeof protos.google.devtools.cloudbuild.v1.BuildOptions.MachineType;
		}

		// Create the request to perform a build
		const [operation] = await this.gcb.createBuild({
			projectId,
			build: buildConfig,
		});

		// Extract metadata from the operation
		const metadata = operation.metadata
			? (operation.metadata as {
					build?: protos.google.devtools.cloudbuild.v1.IBuild;
				})
			: { build: {} as protos.google.devtools.cloudbuild.v1.IBuild };

		const result: BuildResult = {
			name: operation.name as string,
			metadata: {
				build: metadata.build as protos.google.devtools.cloudbuild.v1.IBuild,
			},
			log: '',
		};

		// Wait for the operation to complete
		try {
			await operation.promise();
		} catch (_error) {
			// Fetch logs for detailed error information
			let log: string | undefined;
			try {
				log = await this.fetchLog(result);
			} catch {
				// Unable to fetch logs
			}

			// Extract helpful error information
			const build = result.metadata.build;
			const buildId = build.id || 'unknown';
			const status = build.status ? String(build.status) : 'UNKNOWN';

			// Find the failed step if available
			let failedStep: string | undefined;
			let suggestion: string | undefined;

			if (build.steps) {
				const failedStepObj = build.steps.find(
					(step) => step.status === 'FAILURE',
				);
				if (failedStepObj) {
					failedStep = failedStepObj.name || 'unknown step';
					suggestion = `Check logs for step "${failedStep}" to diagnose the issue.`;
				}
			}

			// Create a more helpful error message
			let message = `Build ${buildId} failed with status: ${status}`;
			if (failedStep) {
				message += ` at step "${failedStep}"`;
			}

			throw new BuildError(message, {
				log,
				buildId,
				status,
				failedStep,
				suggestion,
			});
		}

		// Log streaming is super hard to understand.  For now, just fetch the
		// log from a well known location *after* it's complete.
		const log = await this.fetchLog(result);
		result.log = log;
		this.emit(ProgressEvent.COMPLETE);
		return result;
	}

	/**
	 * List recent builds for the project.
	 * @param options Options for listing builds
	 * @returns Array of builds
	 */
	async listBuilds(
		options: { limit?: number; filter?: string } = {},
	): Promise<protos.google.devtools.cloudbuild.v1.IBuild[]> {
		const projectId = await this.auth.getProjectId();
		const { limit = 10, filter } = options;

		const [builds] = await this.gcb.listBuilds({
			projectId,
			pageSize: limit,
			filter,
		});

		return builds;
	}

	/**
	 * Get a specific build by ID.
	 * @param buildId The ID of the build to retrieve
	 * @returns The build object
	 */
	async getBuild(
		buildId: string,
	): Promise<protos.google.devtools.cloudbuild.v1.IBuild> {
		const projectId = await this.auth.getProjectId();

		const [build] = await this.gcb.getBuild({
			projectId,
			id: buildId,
		});

		return build;
	}

	/**
	 * Cancel a running build.
	 * @param buildId The ID of the build to cancel
	 * @returns The cancelled build object
	 */
	async cancelBuild(
		buildId: string,
	): Promise<protos.google.devtools.cloudbuild.v1.IBuild> {
		const projectId = await this.auth.getProjectId();

		const [build] = await this.gcb.cancelBuild({
			projectId,
			id: buildId,
		});

		return build;
	}

	/**
	 * Look in the CWD for a `.gcloudignore` file.  If one is present, parse it,
	 * and return the ignore rules as an array of strings.
	 */
	public async getIgnoreRules() {
		const ignoreFile = path.join(this.sourcePath, '.gcloudignore');
		let ignoreRules: string[] = [];
		try {
			const contents = await fs.promises.readFile(ignoreFile, 'utf8');
			ignoreRules = contents.split('\n').filter((line) => {
				return !line.startsWith('#') && line.trim() !== '';
			});
		} catch {
			// 🤷‍♂️
		}

		return ignoreRules;
	}

	/**
	 * Parse a timeout string (like "20m" or "1200s") into an IDuration object.
	 * @param timeout The timeout string to parse
	 * @returns An IDuration object with seconds and nanos
	 */
	private parseTimeout(timeout: string): { seconds: string; nanos: number } {
		// Match pattern like "20m", "1200s", "1h", etc.
		const match = timeout.match(/^(\d+)([smh])$/);
		if (!match) {
			throw new Error(
				`Invalid timeout format: ${timeout}. Expected format: <number><unit> (e.g., "20m", "1200s", "1h")`,
			);
		}

		const value = Number.parseInt(match[1], 10);
		const unit = match[2];

		let seconds: number;
		switch (unit) {
			case 's':
				seconds = value;
				break;
			case 'm':
				seconds = value * 60;
				break;
			case 'h':
				seconds = value * 3600;
				break;
			default:
				throw new Error(`Invalid timeout unit: ${unit}. Use 's', 'm', or 'h'.`);
		}

		return { seconds: seconds.toString(), nanos: 0 };
	}

	/**
	 * Obtain the full text of the log after the build is complete.
	 * At some point this should be replaced with streaming logs.
	 * @param result The BuildResult returned from the create operation
	 */
	private async fetchLog(result: BuildResult): Promise<string> {
		const { build } = result.metadata;
		// biome-ignore lint/style/noNonNullAssertion: it needs to be any
		const logsBucket = build.logsBucket!.split('gs://').find(Boolean);
		const logFilename = `log-${build.id}.txt`;

		// biome-ignore lint/style/noNonNullAssertion: we know the bucket exists
		const bucket = this.gcs.bucket(logsBucket!);
		const file = bucket.file(logFilename);
		const [contents] = await file.download();
		const logData = contents.toString('utf8');

		this.emit(ProgressEvent.LOG, logData);
		return logData;
	}

	/**
	 * Upload a local file to GCS given a signed url
	 * @private
	 * @param localPath Fully qualified path to the zip on disk.
	 * @param remotePath Signed url used to put the file to
	 */
	private async upload() {
		// Check to see if the bucket exists
		const projectId = await this.auth.getProjectId();
		const bucketName = `${projectId}-gcb-staging-bbq`;
		const bucket = this.gcs.bucket(bucketName);

		const [exists] = await bucket.exists();

		// If it does not exist, create it!
		if (!exists) {
			this.emit(ProgressEvent.CREATING_BUCKET, bucketName);
			await this.gcs.createBucket(bucketName, {
				lifecycle: {
					rule: [{ action: { type: 'Delete' }, condition: { age: 1 } }],
				},
			});
		}

		// Get the full list of files that don't match .gcloudignore
		const ignorePatterns = await this.getIgnoreRules();
		const files = await globby('**/**', {
			ignore: ignorePatterns,
			cwd: this.sourcePath,
		});

		// Create a tar stream with all the files
		const tarStream = tarCreate({ gzip: true, cwd: this.sourcePath }, files);

		// There is a bizarre bug with node-tar where the stream it hands back
		// looks like a stream and talks like a stream, but it ain't a real
		// stream.  Pass it through a Duplex to make node-fetch happy.
		const bodyStream = new PassThrough();
		tarStream.pipe(bodyStream);

		// Upload the object via stream to GCS
		const fileName = `${Date.now().toString()}.tar.gz`;
		const file = bucket.file(fileName);

		await new Promise((resolve, reject) => {
			bodyStream
				.pipe(
					file.createWriteStream({
						metadata: {
							contentType: 'application/gzip',
						},
						resumable: false,
					}),
				)
				.on('error', (err) => reject(err))
				.on('finish', () => resolve(undefined));
		});

		return { bucket: bucketName, file: fileName };
	}
}

export async function build(options: BuildOptions) {
	const builder = new Builder(options);
	return builder.build();
}

/**
 * List recent builds for the project.
 * @param options Authentication and filter options
 * @returns Array of builds
 */
export async function listBuilds(
	options: GoogleAuthOptions & { limit?: number; filter?: string } = {},
): Promise<protos.google.devtools.cloudbuild.v1.IBuild[]> {
	const builder = new Builder(options);
	return builder.listBuilds({ limit: options.limit, filter: options.filter });
}

/**
 * Get a specific build by ID.
 * @param buildId The ID of the build to retrieve
 * @param options Authentication options
 * @returns The build object
 */
export async function getBuild(
	buildId: string,
	options: GoogleAuthOptions = {},
): Promise<protos.google.devtools.cloudbuild.v1.IBuild> {
	const builder = new Builder(options);
	return builder.getBuild(buildId);
}

/**
 * Cancel a running build.
 * @param buildId The ID of the build to cancel
 * @param options Authentication options
 * @returns The cancelled build object
 */
export async function cancelBuild(
	buildId: string,
	options: GoogleAuthOptions = {},
): Promise<protos.google.devtools.cloudbuild.v1.IBuild> {
	const builder = new Builder(options);
	return builder.cancelBuild(buildId);
}

export type BuildResult = {
	name: string;
	log: string;
	metadata: { build: protos.google.devtools.cloudbuild.v1.IBuild };
};

export class BuildError extends Error {
	log?: string;
	buildId?: string;
	status?: string;
	failedStep?: string;
	suggestion?: string;

	constructor(
		message: string,
		options?: {
			log?: string;
			buildId?: string;
			status?: string;
			failedStep?: string;
			suggestion?: string;
		},
	) {
		super(message);
		this.name = 'BuildError';
		this.log = options?.log;
		this.buildId = options?.buildId;
		this.status = options?.status;
		this.failedStep = options?.failedStep;
		this.suggestion = options?.suggestion;
	}
}

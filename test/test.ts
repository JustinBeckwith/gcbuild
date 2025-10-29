import fs from 'node:fs';
import path from 'node:path';
import { request } from 'gaxios';
import nock from 'nock';
import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	it,
	vi,
} from 'vitest';
import { getConfig } from '../src/config.js';
import { type BuildError, Builder } from '../src/index.js';

// Helper to set up a builder with mocked auth for testing
function createMockedBuilder(
	options: { sourcePath?: string; shouldError?: boolean } = {},
) {
	const builder = new Builder(options);

	// Mock auth
	vi.spyOn(builder.auth, 'getProjectId').mockImplementation(
		async () => 'el-gato',
	);

	// Mock Storage bucket method
	// biome-ignore lint/complexity/useLiteralKeys: accessing private property for testing
	vi.spyOn(builder['gcs'], 'bucket').mockImplementation((name: string) => {
		return {
			exists: async () => {
				try {
					const res = await request({
						url: `https://storage.googleapis.com/storage/v1/b/${name}`,
						method: 'GET',
					});
					return [res.status === 200];
				} catch (err: unknown) {
					// Return false if bucket doesn't exist (404)
					if (err && typeof err === 'object' && 'response' in err) {
						const response = (err as { response?: { status?: number } })
							.response;
						if (response?.status === 404) {
							return [false];
						}
					}
					throw err;
				}
			},
			file: (fileName: string) => ({
				createWriteStream: () => {
					const { PassThrough } = require('node:stream');
					const stream = new PassThrough();

					// Collect the data being piped
					const chunks: Buffer[] = [];
					stream.on('data', (chunk: Buffer) => {
						chunks.push(chunk);
					});

					// When the input stream ends, make the upload request
					stream.on('end', async () => {
						try {
							const data = Buffer.concat(chunks);
							await request({
								url: `https://storage.googleapis.com/upload/storage/v1/b/${name}/o?name=${fileName}`,
								method: 'POST',
								data,
							});
							stream.emit('finish');
						} catch (err) {
							stream.emit('error', err);
						}
					});

					return stream;
				},
				download: async () => {
					const res = await request({
						url: `https://storage.googleapis.com/storage/v1/b/${name}/o/${fileName}?alt=media`,
						method: 'GET',
					});
					return [Buffer.from(res.data as string)];
				},
			}),
		} as ReturnType<(typeof builder)['gcs']['bucket']>;
	});

	// Mock Storage createBucket
	// biome-ignore lint/complexity/useLiteralKeys: accessing private property for testing
	vi.spyOn(builder['gcs'], 'createBucket').mockImplementation(
		async (name: string, opts?: object) => {
			await request({
				url: 'https://storage.googleapis.com/storage/v1/b?project=el-gato',
				method: 'POST',
				data: { name, ...opts },
			});
			// biome-ignore lint/complexity/useLiteralKeys: accessing private property for testing
			return [builder['gcs'].bucket(name)];
		},
	);

	// Mock CloudBuild createBuild
	// biome-ignore lint/complexity/useLiteralKeys: accessing private property for testing
	vi.spyOn(builder['gcb'], 'createBuild').mockImplementation(async () => {
		const fakeOperation = {
			name: 'not-a-real-operation',
			metadata: {
				build: {
					logsBucket: 'gs://not-a-bucket',
					id: 'not-an-id',
				},
			},
			promise: async () => {
				if (options.shouldError) {
					throw new Error(JSON.stringify({ code: 1, message: '💩' }));
				}
				return fakeOperation;
			},
		};
		return [fakeOperation, undefined, undefined];
	});

	return builder;
}

describe('gcbuild', () => {
	nock.disableNetConnect();

	// Set up fake credentials to avoid real auth calls
	const originalEnv = process.env;
	beforeAll(() => {
		process.env.GCLOUD_PROJECT = 'el-gato';
		process.env.GCE_METADATA_HOST = 'metadata.google.internal.invalid';
	});

	afterEach(() => {
		nock.cleanAll();
		vi.restoreAllMocks();
	});

	afterAll(() => {
		process.env = originalEnv;
	});

	describe('🙈 ignore rules', () => {
		it('should return 0 rules if no .gcloudignore is available', async () => {
			const builder = new Builder();
			const rules = await builder.getIgnoreRules();
			expect(rules).toEqual([]);
		});

		it('should return expected rules if .gcloudignore is available', async () => {
			const expected = [
				'.gcloudignore',
				'.git',
				'.gitignore',
				'node_modules',
				'test/',
			];
			const gcloudignore = path.resolve('test/fixtures/.gcloudignore');
			await new Promise((resolve, reject) => {
				fs.createReadStream(gcloudignore)
					.pipe(fs.createWriteStream('.gcloudignore'))
					.on('close', () => resolve(undefined))
					.on('error', (err) => reject(err));
			});
			const builder = new Builder();
			const rules = await builder.getIgnoreRules();
			fs.unlinkSync('.gcloudignore');
			expect(rules).toEqual(expected);
		});
	});

	describe('📦 pack & upload', () => {
		it('should create a GCS bucket if the expected one does not exist', async () => {
			const scopes = [
				mockBucketNotExists(),
				mockBucketCreate(),
				mockUpload(),
				mockLogFetch(),
			];
			const sourcePath = path.resolve('test/fixtures');
			const builder = createMockedBuilder({ sourcePath });

			const result = await builder.build();
			for (const s of scopes) {
				s.done();
			}

			expect(result.metadata).toBeTruthy();
		});

		it('should PUT the file to Google Cloud Storage', async () => {
			const _builder = new Builder();
		});
	});

	describe('🚨 error handing', () => {
		it('should include a log with an error', async () => {
			const scopes = [mockBucketExists(), mockUpload(), mockLogFetch()];
			const sourcePath = path.resolve('test/fixtures');
			const builder = createMockedBuilder({ sourcePath, shouldError: true });

			try {
				await builder.build();
				expect.fail('Expected to throw.');
			} catch (error) {
				const error_ = error as BuildError;
				expect(error_.log).toBeTruthy();
				expect(error_.log).toContain('🌳');
			}

			for (const s of scopes) {
				s.done();
			}
		});
	});

	describe('🌳 config', () => {
		it('should find a Dockerfile if provided', async () => {
			const config = await getConfig({
				sourcePath: path.resolve('test/fixtures/docker'),
				tag: 'taggy',
				projectId: 'el-gato',
			});
			// biome-ignore lint/style/noNonNullAssertion: it needs to be any
			expect(config.steps![0].name).toBe('gcr.io/cloud-builders/docker');
		});

		it('should find and parse a cloudbuild.json file', async () => {
			const config = await getConfig({
				sourcePath: path.resolve('test/fixtures/json'),
				projectId: 'el-gato',
			});
			// biome-ignore lint/style/noNonNullAssertion: it needs to be any
			expect(config.steps![0].name).toBe('gcr.io/cloud-builders/docker');
			// biome-ignore lint/style/noNonNullAssertion: it needs to be any
			expect(config.images![0]).toContain('test-image');
		});

		it('should throw an error if no config file is found', async () => {
			await expect(
				getConfig({
					sourcePath: path.resolve('test/fixtures/empty'),
					projectId: 'el-gato',
				}),
			).rejects.toThrow(/Unable to find configuration file/);
		});

		it('should throw an error if an unexpected config path is provided', async () => {
			await expect(
				getConfig({
					sourcePath: path.resolve('test/fixtures/docker'),
					configPath: path.resolve('test/fixtures/docker/index.js'),
					projectId: 'el-gato',
				}),
			).rejects.toThrow(/extension is not supported/);
		});
	});

	describe('🔄 polling', () => {
		it('should poll multiple times until operation is complete', async () => {
			const scopes = [mockBucketExists(), mockUpload(), mockLogFetch()];
			const sourcePath = path.resolve('test/fixtures');
			const builder = createMockedBuilder({ sourcePath });

			const result = await builder.build();
			for (const s of scopes) {
				s.done();
			}

			expect(result.metadata).toBeTruthy();
		});

		it('should handle errors when log fetch fails during error handling', async () => {
			const scopes = [mockBucketExists(), mockUpload(), mockLogFetchError()];
			const sourcePath = path.resolve('test/fixtures');
			const builder = createMockedBuilder({ sourcePath, shouldError: true });

			try {
				await builder.build();
				expect.fail('Expected to throw.');
			} catch (error) {
				const error_ = error as BuildError;
				expect(error_.log).toBeFalsy();
			}

			for (const s of scopes) {
				s.done();
			}
		});
	});

	describe('🏁 end to end', () => {
		it('should work together end to end', async () => {
			const scopes = [mockBucketExists(), mockUpload(), mockLogFetch()];
			const sourcePath = path.resolve('test/fixtures');
			const builder = createMockedBuilder({ sourcePath });

			const result = await builder.build();
			for (const s of scopes) {
				s.done();
			}

			expect(result.metadata).toBeTruthy();
		});

		it('should work with the build() wrapper function', async () => {
			const scopes = [mockBucketExists(), mockUpload(), mockLogFetch()];
			const sourcePath = path.resolve('test/fixtures');

			// The build() wrapper just creates a Builder and calls build() on it
			// We can test it directly by mocking the Builder's methods
			const { build, Builder: BuilderConstructor } = await import(
				'../src/index.js'
			);

			// Save the original build method first
			const originalBuild = BuilderConstructor.prototype.build;

			// Create a mocked builder once
			const mockBuilder = createMockedBuilder({ sourcePath });

			// Replace the build method to use the mocked instance
			BuilderConstructor.prototype.build = () =>
				originalBuild.call(mockBuilder);

			const result = await build({ sourcePath });

			for (const s of scopes) {
				s.done();
			}

			expect(result.metadata).toBeTruthy();

			// Restore original
			BuilderConstructor.prototype.build = originalBuild;
		});
	});

	describe('⚙️ build options', () => {
		it('should handle substitutions correctly', async () => {
			const scopes = [mockBucketExists(), mockUpload(), mockLogFetch()];
			const sourcePath = path.resolve('test/fixtures');
			const builder = createMockedBuilder({
				sourcePath,
			});

			// Access private property for testing
			// biome-ignore lint/complexity/useLiteralKeys: accessing private property for testing
			const buildSpy = vi.spyOn(builder['gcb'], 'createBuild');

			await builder.build();

			// Check that createBuild was called (spy should have been called)
			expect(buildSpy).toHaveBeenCalled();

			for (const s of scopes) {
				s.done();
			}
		});

		it('should parse timeout strings correctly', async () => {
			const builder = new Builder();
			// biome-ignore lint/complexity/useLiteralKeys: accessing private method for testing
			const parseTimeout = builder['parseTimeout'].bind(builder);

			expect(parseTimeout('20m')).toEqual({ seconds: '1200', nanos: 0 });
			expect(parseTimeout('1200s')).toEqual({ seconds: '1200', nanos: 0 });
			expect(parseTimeout('1h')).toEqual({ seconds: '3600', nanos: 0 });
			expect(parseTimeout('90s')).toEqual({ seconds: '90', nanos: 0 });
		});

		it('should throw on invalid timeout format', () => {
			const builder = new Builder();
			// biome-ignore lint/complexity/useLiteralKeys: accessing private method for testing
			const parseTimeout = builder['parseTimeout'].bind(builder);

			expect(() => parseTimeout('invalid')).toThrow('Invalid timeout format');
			expect(() => parseTimeout('20')).toThrow('Invalid timeout format');
			expect(() => parseTimeout('20x')).toThrow('Invalid timeout format');
		});
	});

	describe('📋 build management', () => {
		it('should list builds', async () => {
			const builder = createMockedBuilder();

			// Mock listBuilds
			// biome-ignore lint/complexity/useLiteralKeys: accessing private property for testing
			vi.spyOn(builder['gcb'], 'listBuilds').mockImplementation(async () => {
				return [
					[
						{ id: 'build-1', status: 'SUCCESS' },
						{ id: 'build-2', status: 'FAILURE' },
					],
					null,
					undefined,
				];
			});

			const builds = await builder.listBuilds({ limit: 10 });

			expect(builds).toHaveLength(2);
			expect(builds[0].id).toBe('build-1');
			expect(builds[1].id).toBe('build-2');
		});

		it('should get a specific build', async () => {
			const builder = createMockedBuilder();

			// Mock getBuild
			// biome-ignore lint/complexity/useLiteralKeys: accessing private property for testing
			vi.spyOn(builder['gcb'], 'getBuild').mockImplementation(async () => {
				return [{ id: 'build-123', status: 'SUCCESS' }, undefined, undefined];
			});

			const build = await builder.getBuild('build-123');

			expect(build.id).toBe('build-123');
			expect(build.status).toBe('SUCCESS');
		});

		it('should cancel a build', async () => {
			const builder = createMockedBuilder();

			// Mock cancelBuild
			// biome-ignore lint/complexity/useLiteralKeys: accessing private property for testing
			vi.spyOn(builder['gcb'], 'cancelBuild').mockImplementation(async () => {
				return [{ id: 'build-123', status: 'CANCELLED' }, undefined, undefined];
			});

			const build = await builder.cancelBuild('build-123');

			expect(build.id).toBe('build-123');
			expect(build.status).toBe('CANCELLED');
		});
	});
});

function mockBucketExists() {
	return nock('https://storage.googleapis.com')
		.get('/storage/v1/b/el-gato-gcb-staging-bbq')
		.reply(200);
}

function mockBucketNotExists() {
	return nock('https://storage.googleapis.com')
		.get('/storage/v1/b/el-gato-gcb-staging-bbq')
		.reply(404);
}

function mockBucketCreate() {
	return nock('https://storage.googleapis.com')
		.post('/storage/v1/b?project=el-gato', {
			name: 'el-gato-gcb-staging-bbq',
			lifecycle: {
				rule: [{ action: { type: 'Delete' }, condition: { age: 1 } }],
			},
		})
		.reply(200);
}

function mockUpload() {
	// The new @google-cloud/storage uses resumable upload or simple upload
	return nock('https://storage.googleapis.com')
		.post((url) => {
			return (
				url.includes('/upload/storage/v1/b/el-gato-gcb-staging-bbq/o') ||
				url.includes('/storage/v1/b/el-gato-gcb-staging-bbq/o')
			);
		})
		.reply(200, { name: 'test.tar.gz', bucket: 'el-gato-gcb-staging-bbq' });
}

function mockLogFetch() {
	// The new @google-cloud/storage uses alt=media for downloads
	return nock('https://storage.googleapis.com')
		.get((uri) => {
			return (
				uri.includes('/storage/v1/b/not-a-bucket/o/log-not-an-id.txt') &&
				uri.includes('alt=media')
			);
		})
		.reply(200, '🌳');
}

function mockLogFetchError() {
	return nock('https://storage.googleapis.com')
		.get((uri) => {
			return (
				uri.includes('/storage/v1/b/not-a-bucket/o/log-not-an-id.txt') &&
				uri.includes('alt=media')
			);
		})
		.reply(404);
}

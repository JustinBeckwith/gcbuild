import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import { type GaxiosOptions, request } from 'gaxios';
import { afterEach, describe, it } from 'mocha';
import nock from 'nock';
import * as sinon from 'sinon';
import { getConfig } from '../src/config.js';
import { type BuildError, Builder } from '../src/index.js';

describe('gcbuild', () => {
	nock.disableNetConnect();

	afterEach(() => {
		nock.cleanAll();
		sinon.restore();
	});

	describe('🙈 ignore rules', () => {
		it('should return 0 rules if no .gcloudignore is available', async () => {
			const builder = new Builder();
			const rules = await builder.getIgnoreRules();
			assert.deepStrictEqual(rules, []);
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
					.on('close', resolve)
					.on('error', reject);
			});
			const builder = new Builder();
			const rules = await builder.getIgnoreRules();
			fs.unlinkSync('.gcloudignore');
			assert.deepStrictEqual(rules, expected);
		});
	});

	describe('📦 pack & upload', () => {
		it('should create a GCS bucket if the expected one does not exist', async () => {
			const scopes = [
				mockBucketNotExists(),
				mockBucketCreate(),
				mockUpload(),
				mockBuild(),
				mockPoll(),
				mockLogFetch(),
			];
			const sourcePath = path.resolve('test/fixtures');
			const builder = new Builder({ sourcePath });
			sinon.stub(builder.auth, 'getProjectId').resolves('el-gato');
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			sinon.stub(builder.auth, 'getClient').resolves({
				async request(options: GaxiosOptions) {
					return request(options);
				},
				// biome-ignore lint/suspicious/noExplicitAny: it needs to be any
			} as any);
			const result = await builder.build();
			for (const s of scopes) {
				s.done();
			}

			assert.ok(result.metadata);
		});

		it('should PUT the file to Google Cloud Storage', async () => {
			const _builder = new Builder();
		});
	});

	describe('🚨 error handing', () => {
		it('should include a log with an error', async () => {
			const scopes = [
				mockBucketExists(),
				mockUpload(),
				mockBuild(),
				mockPollError(),
				mockLogFetch(),
			];
			const sourcePath = path.resolve('test/fixtures');
			const builder = new Builder({ sourcePath });
			sinon.stub(builder.auth, 'getProjectId').resolves('el-gato');
			sinon.stub(builder.auth, 'getClient').resolves({
				async request(options: GaxiosOptions) {
					return request(options);
				},
				// biome-ignore lint/suspicious/noExplicitAny: it needs to be any
			} as any);
			try {
				await builder.build();
				assert.fail('Expected to throw.');
			} catch (error) {
				const error_ = error as BuildError;
				assert.ok(error_.log);
				assert.ok(
					error_.log.includes('🌳'),
					`
            Expected to match:
              ${chalk.green('🌳')}
              ${chalk.red(error_.log)}
          `,
				);
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
			assert.strictEqual(config.steps![0].name, 'gcr.io/cloud-builders/docker');
		});

		it('should throw an error if an unexpected config path is provided', async () => {
			await assert.rejects(
				getConfig({
					sourcePath: path.resolve('test/fixtures/docker'),
					configPath: path.resolve('test/fixtures/docker/index.js'),
					projectId: 'el-gato',
				}),
				/extension is not supported/,
			);
		});
	});

	describe('🏁 end to end', () => {
		it('should work together end to end', async () => {
			const scopes = [
				mockBucketExists(),
				mockUpload(),
				mockBuild(),
				mockPoll(),
				mockLogFetch(),
			];
			const sourcePath = path.resolve('test/fixtures');
			const builder = new Builder({ sourcePath });
			sinon.stub(builder.auth, 'getProjectId').resolves('el-gato');
			sinon.stub(builder.auth, 'getClient').resolves({
				async request(options: GaxiosOptions) {
					return request(options);
				},
				// biome-ignore lint/suspicious/noExplicitAny: it needs to be any
			} as any);
			const result = await builder.build();
			for (const s of scopes) {
				s.done();
			}

			assert.ok(result.metadata);
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
	return nock('https://storage.googleapis.com')
		.post((url) => {
			return url.includes('/storage/v1/b/el-gato-gcb-staging-bbq/o?name=');
		})
		.reply(200);
}

function mockBuild() {
	return nock('https://cloudbuild.googleapis.com')
		.post('/v1/projects/el-gato/builds')
		.reply(200, {
			name: 'not-a-real-operation',
			metadata: { build: { logsBucket: 'gs://not-a-bucket', id: 'not-an-id' } },
		});
}

function mockPoll() {
	return nock('https://cloudbuild.googleapis.com')
		.get('/v1/not-a-real-operation')
		.reply(200, { done: true });
}

function mockLogFetch() {
	return nock('https://storage.googleapis.com')
		.get('/storage/v1/b/not-a-bucket/o/log-not-an-id.txt?alt=media')
		.reply(200, '🌳');
}

function mockPollError() {
	return nock('https://cloudbuild.googleapis.com')
		.get('/v1/not-a-real-operation')
		.reply(200, { error: '💩' });
}

import * as assert from 'assert';
import {describe, it, afterEach} from 'mocha';
import chalk = require('chalk');
import * as fs from 'fs';
import * as nock from 'nock';
import * as path from 'path';
import * as proxyquire from 'proxyquire';

import {BuildError} from '../src';
import {getConfig} from '../src/config';

describe('gcbuild', () => {
  nock.disableNetConnect();

  afterEach(() => nock.cleanAll());

  const {Builder} = proxyquire('../src/index', {
    'google-auth-library': {
      GoogleAuth: class {
        async getProjectId() {
          return 'el-gato';
        }
        async getClient() {
          return class {
            async request() {
              return {};
            }
          };
        }
      },
    },
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
      const builder = new Builder({sourcePath});
      const result = await builder.build();
      scopes.forEach(s => s.done());
      assert.ok(result.metadata);
    });

    it('should PUT the file to Google Cloud Storage', async () => {
      new Builder();
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
      const builder = new Builder({sourcePath});
      try {
        await builder.build();
        assert.fail('Expected to throw.');
      } catch (e) {
        const err = e as BuildError;
        assert.ok(err.log);
        assert.ok(
          err.log!.includes('🌳'),
          `
            Expected to match:
              ${chalk.green('🌳')}
              ${chalk.red(err.log!)}
          `
        );
      }
      scopes.forEach(s => s.done());
    });
  });

  describe('🌳 config', () => {
    it('should find a Dockerfile if provided', async () => {
      const config = await getConfig({
        sourcePath: path.resolve('test/fixtures/docker'),
        tag: 'taggy',
        projectId: 'el-gato',
      });
      assert.strictEqual(config.steps![0].name, 'gcr.io/cloud-builders/docker');
    });

    it('should throw an error if an unexpected config path is provided', async () => {
      await assert.rejects(
        getConfig({
          sourcePath: path.resolve('test/fixtures/docker'),
          configPath: path.resolve('test/fixtures/docker/index.js'),
          projectId: 'el-gato',
        }),
        /extension is not supported/
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
      const builder = new Builder({sourcePath});
      const result = await builder.build();
      scopes.forEach(s => s.done());
      assert.ok(result.metadata);
    });
  });
});

function mockBucketExists() {
  return nock('https://www.googleapis.com')
    .get('/storage/v1/b/el-gato-gcb-staging-bbq')
    .reply(200);
}

function mockBucketNotExists() {
  return nock('https://www.googleapis.com')
    .get('/storage/v1/b/el-gato-gcb-staging-bbq')
    .reply(404);
}

function mockBucketCreate() {
  return nock('https://www.googleapis.com')
    .post('/storage/v1/b?project=el-gato', {
      name: 'el-gato-gcb-staging-bbq',
      lifecycle: {
        rule: [{action: {type: 'Delete'}, condition: {age: 1}}],
      },
    })
    .reply(200);
}

function mockUpload() {
  return nock('https://www.googleapis.com')
    .post(url => {
      return url.includes('/storage/v1/b/el-gato-gcb-staging-bbq/o?name=');
    })
    .reply(200);
}

function mockBuild() {
  return nock('https://cloudbuild.googleapis.com')
    .post('/v1/projects/el-gato/builds')
    .reply(200, {
      name: 'not-a-real-operation',
      metadata: {build: {logsBucket: 'gs://not-a-bucket', id: 'not-an-id'}},
    });
}

function mockPoll() {
  return nock('https://cloudbuild.googleapis.com')
    .get('/v1/not-a-real-operation')
    .reply(200, {done: true});
}

function mockLogFetch() {
  return nock('https://www.googleapis.com')
    .get('/storage/v1/b/not-a-bucket/o/log-not-an-id.txt?alt=media')
    .reply(200, '🌳');
}

function mockPollError() {
  return nock('https://cloudbuild.googleapis.com')
    .get('/v1/not-a-real-operation')
    .reply(200, {error: '💩'});
}

import * as assert from 'assert';
import * as fs from 'fs';
import * as nock from 'nock';
import * as path from 'path';
import * as proxyquire from 'proxyquire';

const sourcePath = path.resolve('test/fixtures/');
const gcloudignore = path.resolve('test/fixtures/.gcloudignore');

describe('gcbuild', () => {
  nock.disableNetConnect();

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
      }
    }
  });

  describe('ignore rules', () => {
    it('should return 0 rules if no .gcloudignore is available', async () => {
      const builder = new Builder();
      const rules = await builder.getIgnoreRules();
      assert.deepStrictEqual(rules, []);
    });

    it('should return expected rules if .gcloudignore is available',
       async () => {
         const expected =
             ['.gcloudignore', '.git', '.gitignore', 'node_modules', 'test/'];
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

  describe('pack & upload', () => {
    it('should create a GCS bucket if the expected one does not exist',
       async () => {
         const builder = new Builder();
       });

    it('should PUT the file to Google Cloud Storage', async () => {
      const builder = new Builder();
    });
  });

  describe('end to end', () => {
    it('should work together end to end', async () => {
      const scopes = [
        mockBucketExists(), mockUpload(), mockBuild(), mockPoll(),
        mockLogFetch()
      ];
      const builder = new Builder({sourcePath});
      await builder.build();
      scopes.forEach(s => s.done());
    });
  });
});

function mockBucketExists() {
  return nock('https://www.googleapis.com')
      .get('/storage/v1/b/el-gato-gcb-staging-bbq')
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
        metadata: {build: {logsBucket: 'gs://not-a-bucket', id: 'not-an-id'}}
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

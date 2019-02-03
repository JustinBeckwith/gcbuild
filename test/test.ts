import * as assert from 'assert';
import * as fs from 'fs';
import * as nock from 'nock';
import * as path from 'path';
import * as proxyquire from 'proxyquire';
import * as util from 'util';

import * as gcbx from '../src';
import {Builder, BuildOptions} from '../src';

// tslint:disable-next-line variable-name
const Zip = require('node-stream-zip');

nock.disableNetConnect();

const unlink = util.promisify(fs.unlink);

const name = '🦄';
const targetDir = path.resolve('test/fixtures/');
const gcloudignore = path.resolve('test/fixtures/.gcloudignore');


const gcb: typeof gcbx = proxyquire('../src/index', {
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

describe(
    'validation',
    () => {

    });

describe('ignore rules', () => {
  it('should return 0 rules if no .gcloudignore is availabe', async () => {
    const deployer = new Builder({sourcePath: '.'});
    const rules = await deployer._getIgnoreRules();
    assert.deepStrictEqual(rules, []);
  });

  it('should return expected rules if .gcloudignore is availabe', async () => {
    const expected =
        ['.gcloudignore', '.git', '.gitignore', 'node_modules', 'test/'];
    await new Promise((resolve, reject) => {
      fs.createReadStream(gcloudignore)
          .pipe(fs.createWriteStream('.gcloudignore'))
          .on('close', resolve)
          .on('error', reject);
    });
    const builder = new Builder({sourcePath: '.'});
    const rules = await builder._getIgnoreRules();
    await unlink('.gcloudignore');
    assert.deepStrictEqual(rules, expected);
  });
});

describe('pack & upload', () => {
  it('should PUT the file to Google Cloud Storage',
     async () => {
         // const deployer = new gcb.builder({name, targetDir});
         // const scope = mockUpload();
         // await deployer._upload(zipFile, 'https://fake.local');
         // scope.done();
     });
});

describe('end to end', () => {
  it.skip('should work together end to end', async () => {
    const scopes = [mockUpload(), mockBuild(), mockPoll()];
    const builder =
        new Builder({sourcePath: path.join(__dirname, '../../test/fixtures')});
    await builder.build();
    scopes.forEach(s => s.done());
  });
});

function mockUpload() {
  return nock('https://fake.local', {
           reqheaders: {
             'Content-Type': 'application/zip',
             'x-goog-content-length-range': '0,104857600'
           }
         })
      .put('/')
      .reply(200);
}

function mockBuild() {
  return nock('https://cloudbuild.googleapis.com')
      .post('/v1/projects/el-gato/locations/us-central1/functions')
      .reply(200, {name: 'not-a-real-operation'});
}

function mockPoll() {
  return nock('https://cloudbuild.googleapis.com')
      .get('/v1/not-a-real-operation')
      .reply(200, {done: true});
}

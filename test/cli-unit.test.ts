import fs from 'node:fs';
import path from 'node:path';
import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest';

const buildMock = vi.fn();

vi.mock('../src/index.js', async () => {
	const actual =
		await vi.importActual<typeof import('../src/index.js')>('../src/index.js');

	class MockBuilder {
		on() {
			return this;
		}

		async build() {
			return buildMock();
		}
	}

	return {
		...actual,
		Builder: MockBuilder,
	};
});

import { generateIgnoreFile, hasIgnoreFile, main } from '../src/cli.js';

describe('CLI unit tests', () => {
	// Set up fake credentials to avoid real auth calls
	const originalEnv = process.env;
	beforeAll(() => {
		process.env.GCLOUD_PROJECT = 'el-gato';
		process.env.GCE_METADATA_HOST = 'metadata.google.internal.invalid';
	});

	afterAll(() => {
		process.env = originalEnv;
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('hasIgnoreFile', () => {
		let testDir: string;
		let ignoreFilePath: string;

		beforeEach(async () => {
			testDir = await fs.promises.mkdtemp(
				path.join(path.resolve('test/fixtures'), 'temp-cli-unit-'),
			);
			ignoreFilePath = path.join(testDir, '.gcloudignore');
		});

		afterEach(async () => {
			try {
				await fs.promises.rm(testDir, { recursive: true, force: true });
			} catch {
				// Ignore cleanup errors
			}
		});

		it('should return false when .gcloudignore does not exist', async () => {
			const result = await hasIgnoreFile(testDir);
			expect(result).toBe(false);
		});

		it('should return true when .gcloudignore exists', async () => {
			await fs.promises.writeFile(ignoreFilePath, 'node_modules\n');
			const result = await hasIgnoreFile(testDir);
			expect(result).toBe(true);
		});
	});

	describe('generateIgnoreFile', () => {
		let testDir: string;
		let ignoreFilePath: string;

		beforeEach(async () => {
			testDir = await fs.promises.mkdtemp(
				path.join(path.resolve('test/fixtures'), 'temp-cli-unit-'),
			);
			ignoreFilePath = path.join(testDir, '.gcloudignore');
		});

		afterEach(async () => {
			try {
				await fs.promises.rm(testDir, { recursive: true, force: true });
			} catch {
				// Ignore cleanup errors
			}
		});

		it('should generate a .gcloudignore file', async () => {
			await generateIgnoreFile(testDir);

			const exists = fs.existsSync(ignoreFilePath);
			expect(exists).toBe(true);

			const contents = await fs.promises.readFile(ignoreFilePath, 'utf8');
			expect(contents).toContain('.gcloudignore');
			expect(contents).toContain('.git');
			expect(contents).toContain('node_modules');
		});
	});

	describe('main function', () => {
		it('should call showHelp when more than one argument is provided', async () => {
			const showHelp = vi.fn();
			await main({
				input: ['arg1', 'arg2'],
				flags: {},
				showHelp,
			});

			expect(showHelp).toHaveBeenCalled();
		});

		it('should handle relative source paths', async () => {
			const testDir = 'test/fixtures/docker';
			let helpCalled = false;

			buildMock.mockRejectedValue(new Error('Mock error'));
			const exitSpy = vi
				.spyOn(process, 'exit')
				.mockImplementation((() => {}) as never);

			try {
				await main({
					input: [testDir],
					flags: {},
					showHelp: () => {
						helpCalled = true;
					},
				});
			} catch {
				// Expected to fail with mock error
			}

			expect(helpCalled).toBe(false);
			expect(exitSpy).toHaveBeenCalledWith(1);
		});

		it('should handle absolute source paths', async () => {
			const testDir = path.resolve('test/fixtures/docker');

			buildMock.mockRejectedValue(new Error('Mock error'));
			const exitSpy = vi
				.spyOn(process, 'exit')
				.mockImplementation((() => {}) as never);

			try {
				await main({
					input: [testDir],
					flags: {},
				});
			} catch {
				// Expected to fail with mock error
			}

			expect(exitSpy).toHaveBeenCalledWith(1);
		});

		it('should generate ignore file if missing', async () => {
			const testDir = await fs.promises.mkdtemp(
				path.join(path.resolve('test/fixtures'), 'temp-cli-unit-main-'),
			);
			const ignoreFilePath = path.join(testDir, '.gcloudignore');

			try {
				// Create test directory with a config file
				await fs.promises.writeFile(
					path.join(testDir, 'Dockerfile'),
					'FROM node:20\nCMD ["node", "index.js"]',
				);

				buildMock.mockRejectedValue(new Error('Mock error'));
				const exitSpy = vi
					.spyOn(process, 'exit')
					.mockImplementation((() => {}) as never);

				await main({
					input: [testDir],
					flags: {},
				}).catch(() => {
					// Expected to fail with mock error
				});

				// Check that ignore file was generated
				const exists = fs.existsSync(ignoreFilePath);
				expect(exists).toBe(true);
				expect(exitSpy).toHaveBeenCalledWith(1);
			} finally {
				await fs.promises.rm(testDir, { recursive: true, force: true });
			}
		});

		it('should accept config and tag flags', async () => {
			const testDir = path.resolve('test/fixtures/json');

			buildMock.mockRejectedValue(new Error('Mock error'));
			const exitSpy = vi
				.spyOn(process, 'exit')
				.mockImplementation((() => {}) as never);

			try {
				await main({
					input: [testDir],
					flags: {
						config: path.join(testDir, 'cloudbuild.json'),
						tag: 'my-custom-tag',
					},
				});
			} catch {
				// Expected to fail with mock error
			}

			expect(exitSpy).toHaveBeenCalledWith(1);
		});
	});
});

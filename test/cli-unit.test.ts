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
import { generateIgnoreFile, hasIgnoreFile, main } from '../src/cli.js';
import { Builder } from '../src/index.js';

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
	describe('hasIgnoreFile', () => {
		const testDir = path.resolve('test/fixtures/temp-cli-unit');
		const ignoreFilePath = path.join(testDir, '.gcloudignore');

		beforeEach(async () => {
			await fs.promises.mkdir(testDir, { recursive: true });
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
		const testDir = path.resolve('test/fixtures/temp-cli-unit');
		const ignoreFilePath = path.join(testDir, '.gcloudignore');

		beforeEach(async () => {
			await fs.promises.mkdir(testDir, { recursive: true });
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

			// Mock Builder to prevent actual build
			const buildSpy = vi
				.spyOn(Builder.prototype, 'build')
				.mockRejectedValue(new Error('Mock error'));
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

			buildSpy.mockRestore();
			exitSpy.mockRestore();
		});

		it('should handle absolute source paths', async () => {
			const testDir = path.resolve('test/fixtures/docker');

			// Mock Builder to prevent actual build
			const buildSpy = vi
				.spyOn(Builder.prototype, 'build')
				.mockRejectedValue(new Error('Mock error'));
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

			buildSpy.mockRestore();
			exitSpy.mockRestore();
		});

		it('should generate ignore file if missing', async () => {
			const testDir = path.resolve('test/fixtures/temp-cli-unit-main');
			const ignoreFilePath = path.join(testDir, '.gcloudignore');

			// Create test directory with a config file
			await fs.promises.mkdir(testDir, { recursive: true });
			await fs.promises.writeFile(
				path.join(testDir, 'Dockerfile'),
				'FROM node:20\nCMD ["node", "index.js"]',
			);

			// Mock Builder to prevent actual build
			const buildSpy = vi
				.spyOn(Builder.prototype, 'build')
				.mockRejectedValue(new Error('Mock error'));
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

			// Check that ignore file was generated
			const exists = fs.existsSync(ignoreFilePath);
			expect(exists).toBe(true);

			// Restore mocks BEFORE cleanup to ensure no pending operations
			buildSpy.mockRestore();
			exitSpy.mockRestore();

			// Add a small delay to let any pending async operations complete
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Cleanup
			await fs.promises.rm(testDir, { recursive: true, force: true });
		});

		it('should accept config and tag flags', async () => {
			const testDir = path.resolve('test/fixtures/json');

			// Mock Builder to prevent actual build
			const builderSpy = vi
				.spyOn(Builder.prototype, 'build')
				.mockRejectedValue(new Error('Mock error'));
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

			builderSpy.mockRestore();
			exitSpy.mockRestore();
		});
	});
});

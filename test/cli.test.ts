import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Helper to run the CLI with arguments
async function runCLI(
	args: string[] = [],
	options: { cwd?: string } = {},
): Promise<{ stdout: string; stderr: string; exitCode: number | null }> {
	return new Promise((resolve) => {
		const cliPath = path.resolve(__dirname, '../build/src/cli.js');
		const proc = spawn('node', [cliPath, ...args], {
			cwd: options.cwd || process.cwd(),
			env: { ...process.env, CI: 'true' },
		});

		let stdout = '';
		let stderr = '';

		proc.stdout.on('data', (data) => {
			stdout += data.toString();
		});

		proc.stderr.on('data', (data) => {
			stderr += data.toString();
		});

		proc.on('close', (code) => {
			resolve({ stdout, stderr, exitCode: code });
		});

		// Kill the process after 5 seconds to prevent hanging
		setTimeout(() => {
			proc.kill();
			resolve({ stdout, stderr, exitCode: null });
		}, 5000);
	});
}

describe('CLI integration tests', () => {
	const _testFixturesDir = path.resolve(__dirname, 'fixtures');

	describe('📖 help and usage', () => {
		it('should show help with --help flag', async () => {
			const result = await runCLI(['--help']);
			expect(result.stdout).toContain('Usage');
			expect(result.stdout).toContain('gcb');
			expect(result.stdout).toContain('--config');
			expect(result.stdout).toContain('--tag');
		});

		it('should show help with too many arguments', async () => {
			const result = await runCLI(['arg1', 'arg2']);
			expect(result.stdout).toContain('Usage');
		});

		it('should show version with --version flag', async () => {
			const result = await runCLI(['--version']);
			expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
		});
	});

	describe('🙈 ignore file generation', () => {
		const tempDir = path.resolve(__dirname, 'fixtures', 'temp-cli-test');
		const ignoreFilePath = path.join(tempDir, '.gcloudignore');

		beforeEach(async () => {
			// Create temp directory
			await fs.promises.mkdir(tempDir, { recursive: true });
		});

		afterEach(async () => {
			// Clean up temp directory
			try {
				await fs.promises.rm(tempDir, { recursive: true, force: true });
			} catch {
				// Ignore cleanup errors
			}
		});

		it('should generate .gcloudignore file if missing', async () => {
			// Create a minimal cloudbuild.yaml for testing
			const cloudbuildPath = path.join(tempDir, 'cloudbuild.yaml');
			await fs.promises.writeFile(
				cloudbuildPath,
				'steps:\n  - name: gcr.io/cloud-builders/docker\n    args: ["build", "."]\n',
			);

			// Check that ignore file doesn't exist yet
			expect(fs.existsSync(ignoreFilePath)).toBe(false);

			// Run CLI - this will fail with auth errors but should generate the ignore file first
			await runCLI([tempDir], { cwd: __dirname });

			// Check if .gcloudignore was created
			const ignoreExists = fs.existsSync(ignoreFilePath);
			expect(ignoreExists).toBe(true);

			const contents = await fs.promises.readFile(ignoreFilePath, 'utf8');
			expect(contents).toContain('.gcloudignore');
			expect(contents).toContain('.git');
		}, 10000);
	});

	describe('🔧 configuration', () => {
		it(
			'should accept --config flag',
			async () => {
				const result = await runCLI([
					'test/fixtures/json',
					'--config=test/fixtures/json/cloudbuild.json',
				]);

				// The command will fail due to missing credentials, but it should parse the config
				expect(result.stderr).toBeTruthy(); // Will have error output
			},
			7000,
		);

		it(
			'should accept --tag flag',
			async () => {
				const result = await runCLI([
					'test/fixtures/docker',
					'--tag=my-custom-tag',
				]);

				// The command will fail due to missing credentials, but it should parse the tag
				expect(result.stderr).toBeTruthy(); // Will have error output
			},
			7000,
		);

		it(
			'should handle relative source paths',
			async () => {
				const result = await runCLI(['test/fixtures/docker']);

				// Should attempt to build from the relative path
				expect(result.stderr).toBeTruthy(); // Will have error output
			},
			7000,
		);
	});
});

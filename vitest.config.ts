import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		testTimeout: 10000,
		include: ['test/**/*.ts', '**/*.{test,spec}.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html', 'json-summary'],
			include: ['**/src/**/*.ts'],
			exclude: ['**/*.d.ts', '**/build/**', '**/test/**', '**/node_modules/**'],
			reportsDirectory: './coverage',
			clean: true,
			thresholds: {
				lines: 80,
				functions: 60,
				branches: 55,
				statements: 80,
			},
		},
	},
});

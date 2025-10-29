import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		include: ['test/**/*.ts', '**/*.{test,spec}.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html', 'json-summary'],
			include: ['**/src/**/*.ts'],
			exclude: ['**/*.d.ts', '**/build/**', '**/test/**', '**/node_modules/**'],
			reportsDirectory: './coverage',
			clean: true,
			thresholds: {
				lines: 90,
				functions: 65,
				branches: 80,
				statements: 90,
			},
		},
	},
});

import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: [
		{
			command: 'node e2e/mock-api-server.ts',
			port: 8080,
			reuseExistingServer: !process.env.CI
		},
		{
			command: 'npm run build && npm run preview',
			port: 4173,
			reuseExistingServer: !process.env.CI,
			env: {
				API_URL: 'http://localhost:8080'
			}
		}
	],
	testDir: 'e2e',
	use: {
		baseURL: 'http://localhost:4173'
	}
});

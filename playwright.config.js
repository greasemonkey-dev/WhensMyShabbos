const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './',
    testMatch: '**/*.spec.js',
    timeout: 30000,
    use: {
        headless: true,
        viewport: { width: 1280, height: 720 },
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    reporter: [
        ['list'],
        ['html', { open: 'never' }]
    ],
});

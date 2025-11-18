const { test, expect } = require('@playwright/test');

test.use({
    launchOptions: {
        args: [
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--disable-setuid-sandbox',
            '--no-sandbox',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
        ]
    }
});

test.describe('WhensMyShabbos Visual Testing', () => {

    test('capture application loading state', async ({ page, context }) => {
        // Grant permissions
        await context.grantPermissions(['geolocation']);
        await context.setGeolocation({ latitude: 31.7683, longitude: 35.2137 });

        try {
            // Navigate
            await page.goto('http://localhost:8000', {
                waitUntil: 'domcontentloaded',
                timeout: 10000
            });

            console.log('✅ Page loaded');

            // Wait a bit
            await page.waitForTimeout(2000);

            // Take screenshot
            await page.screenshot({
                path: 'app-loading.png',
                fullPage: true
            });

            console.log('✅ Screenshot saved: app-loading.png');

            // Check basic elements
            const header = await page.locator('header').isVisible();
            const map = await page.locator('#map').isVisible();

            console.log(`Header visible: ${header}`);
            console.log(`Map visible: ${map}`);

        } catch (error) {
            console.log('Error occurred:', error.message);

            // Try to get page content anyway
            const content = await page.content();
            console.log('Page loaded basic HTML:', content.substring(0, 200));
        }
    });

    test('test HTML structure', async ({ page }) => {
        await page.goto('http://localhost:8000', {
            waitUntil: 'domcontentloaded',
            timeout: 10000
        });

        const html = await page.content();

        // Check for key elements in HTML
        expect(html).toContain("When's My Shabbos?");
        expect(html).toContain('maptiler-sdk');
        expect(html).toContain('candle-time');
        expect(html).toContain('havdalah-time');

        console.log('✅ All key HTML elements present');
        console.log('✅ MapTiler SDK script tag found');
        console.log('✅ Shabbos time elements found');
    });
});

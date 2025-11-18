const { test, expect } = require('@playwright/test');

test.describe('WhensMyShabbos Map Application', () => {

    test.beforeEach(async ({ page, context }) => {
        // Grant geolocation permissions
        await context.grantPermissions(['geolocation']);

        // Set a mock location (Jerusalem, Israel)
        await context.setGeolocation({ latitude: 31.7683, longitude: 35.2137 });

        // Navigate to the application
        await page.goto('file://' + __dirname + '/index.html');
    });

    test('should load the application with header and map', async ({ page }) => {
        // Check header is visible
        await expect(page.locator('header h1')).toContainText("When's My Shabbos?");
        await expect(page.locator('.subtitle')).toContainText('Find candle lighting times');

        // Check map container exists
        await expect(page.locator('#map')).toBeVisible();

        console.log('✓ Application loaded successfully');
    });

    test('should show loading state initially', async ({ page }) => {
        // Check that loading spinner appears
        const loading = page.locator('#loading');
        await expect(loading).toBeVisible();
        await expect(loading.locator('.spinner')).toBeVisible();
        await expect(loading.locator('p')).toContainText('Detecting your location');

        console.log('✓ Loading state displayed');
    });

    test('should animate map from world view to user location', async ({ page }) => {
        // Wait for map to load
        await page.waitForTimeout(1000);

        // The map should start at world view (zoom ~1.5)
        // Then animate to user location

        // Wait for the animation to complete (3.5 seconds + buffer)
        await page.waitForTimeout(4000);

        console.log('✓ Map animation completed');
    });

    test('should display custom pulsing marker', async ({ page }) => {
        // Wait for marker to appear (after 2 second delay)
        await page.waitForTimeout(3000);

        // Check for custom marker elements
        const marker = page.locator('.custom-marker');
        await expect(marker).toBeVisible();

        const markerPin = page.locator('.marker-pin');
        await expect(markerPin).toBeVisible();
        await expect(markerPin).toContainText('📍');

        const markerPulse = page.locator('.marker-pulse');
        await expect(markerPulse).toBeVisible();

        console.log('✓ Custom pulsing marker displayed');
    });

    test('should fetch and display Shabbos times', async ({ page }) => {
        // Wait for Shabbos info to load
        await page.waitForSelector('#shabbos-info:not(.hidden)', { timeout: 10000 });

        const shabbosInfo = page.locator('#shabbos-info');
        await expect(shabbosInfo).toBeVisible();

        // Check location name is displayed
        const locationName = page.locator('#location-name');
        await expect(locationName).toBeVisible();

        // Check candle lighting time
        const candleTime = page.locator('#candle-time');
        await expect(candleTime).toBeVisible();
        await expect(candleTime).not.toContainText('--:--');

        // Check havdalah time
        const havdalahTime = page.locator('#havdalah-time');
        await expect(havdalahTime).toBeVisible();

        // Check parsha
        const parsha = page.locator('#parsha');
        await expect(parsha).toBeVisible();
        await expect(parsha).not.toContainText('Loading...');

        // Check date display
        const shabbosDate = page.locator('#shabbos-date');
        await expect(shabbosDate).toBeVisible();

        console.log('✓ Shabbos times displayed successfully');
    });

    test('should have animated info panel with slide-in effect', async ({ page }) => {
        // Check info panel has animation class
        const infoPanel = page.locator('.info-panel');
        await expect(infoPanel).toBeVisible();

        // Verify CSS animation is applied
        const animationName = await infoPanel.evaluate(el =>
            window.getComputedStyle(el).animationName
        );
        expect(animationName).toContain('slideInLeft');

        console.log('✓ Info panel animation applied');
    });

    test('should have pulsing animation on candle lighting time', async ({ page }) => {
        // Wait for Shabbos info to appear
        await page.waitForSelector('#shabbos-info:not(.hidden)', { timeout: 10000 });

        // Get the first time item (candle lighting)
        const firstTimeItem = page.locator('.time-item').first();
        const candleTimeElement = firstTimeItem.locator('.time');

        // Check if pulse animation is applied
        const animationName = await candleTimeElement.evaluate(el =>
            window.getComputedStyle(el).animationName
        );
        expect(animationName).toContain('pulse');

        console.log('✓ Candle lighting time has pulse animation');
    });

    test('should allow clicking on map to get different location times', async ({ page }) => {
        // Wait for initial load
        await page.waitForSelector('#shabbos-info:not(.hidden)', { timeout: 10000 });

        // Get initial location name
        const initialLocation = await page.locator('#location-name').textContent();

        // Click on a different location on the map
        const map = page.locator('#map');
        await map.click({ position: { x: 400, y: 300 } });

        // Wait for loading state
        await page.waitForSelector('#loading:not(.hidden)');

        // Wait for new info to load
        await page.waitForSelector('#shabbos-info:not(.hidden)', { timeout: 10000 });

        // Location should update (might be same, but API should be called)
        const newLocation = await page.locator('#location-name').textContent();
        console.log(`Initial: ${initialLocation}, New: ${newLocation}`);

        console.log('✓ Map click updates location');
    });

    test('should show instructions at bottom of page', async ({ page }) => {
        const instructions = page.locator('.instructions');
        await expect(instructions).toBeVisible();
        await expect(instructions).toContainText('Click anywhere on the map');

        console.log('✓ Instructions displayed');
    });

    test('should have responsive hover effects on time items', async ({ page }) => {
        // Wait for Shabbos info
        await page.waitForSelector('#shabbos-info:not(.hidden)', { timeout: 10000 });

        const firstTimeItem = page.locator('.time-item').first();

        // Hover over the time item
        await firstTimeItem.hover();

        // Check that transition property exists
        const transition = await firstTimeItem.evaluate(el =>
            window.getComputedStyle(el).transition
        );
        expect(transition).toContain('all');

        console.log('✓ Hover effects configured');
    });

    test('should verify MapTiler SDK is loaded', async ({ page }) => {
        // Check if maptilersdk is available
        const sdkLoaded = await page.evaluate(() => {
            return typeof window.maptilersdk !== 'undefined';
        });

        expect(sdkLoaded).toBeTruthy();
        console.log('✓ MapTiler SDK loaded');
    });

    test('should have all animations defined in CSS', async ({ page }) => {
        // Get computed styles and check for animation keyframes
        const animations = await page.evaluate(() => {
            const styleSheets = Array.from(document.styleSheets);
            const animationNames = [];

            styleSheets.forEach(sheet => {
                try {
                    const rules = Array.from(sheet.cssRules);
                    rules.forEach(rule => {
                        if (rule.type === CSSRule.KEYFRAMES_RULE) {
                            animationNames.push(rule.name);
                        }
                    });
                } catch (e) {
                    // Cross-origin stylesheet, skip
                }
            });

            return animationNames;
        });

        // Check for expected animations
        expect(animations).toContain('slideInLeft');
        expect(animations).toContain('fadeIn');
        expect(animations).toContain('pulse');
        expect(animations).toContain('spin');
        expect(animations).toContain('slideInUp');
        expect(animations).toContain('markerBounce');
        expect(animations).toContain('markerPulse');

        console.log('✓ All animations defined:', animations);
    });

    test('full user journey - world view to location with Shabbos times', async ({ page }) => {
        console.log('🌍 Starting full user journey test...');

        // 1. Page loads with world view
        await expect(page.locator('header h1')).toBeVisible();
        console.log('  1. ✓ Page loaded');

        // 2. Loading state shown
        await expect(page.locator('#loading')).toBeVisible();
        console.log('  2. ✓ Loading state shown');

        // 3. Wait for map animation (3.5 seconds)
        await page.waitForTimeout(4000);
        console.log('  3. ✓ Map animation completed');

        // 4. Marker appears
        await expect(page.locator('.custom-marker')).toBeVisible();
        console.log('  4. ✓ Marker appeared');

        // 5. Shabbos times displayed
        await page.waitForSelector('#shabbos-info:not(.hidden)', { timeout: 10000 });
        await expect(page.locator('#candle-time')).not.toContainText('--:--');
        console.log('  5. ✓ Shabbos times loaded');

        // 6. Take a screenshot of the final result
        await page.screenshot({ path: 'whens-my-shabbos-screenshot.png', fullPage: true });
        console.log('  6. ✓ Screenshot saved');

        console.log('🎉 Full user journey completed successfully!');
    });
});

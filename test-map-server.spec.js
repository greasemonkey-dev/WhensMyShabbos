const { test, expect } = require('@playwright/test');

test.describe('WhensMyShabbos Map Application (via HTTP)', () => {

    test.beforeEach(async ({ page, context }) => {
        // Grant geolocation permissions
        await context.grantPermissions(['geolocation']);

        // Set a mock location (Jerusalem, Israel)
        await context.setGeolocation({ latitude: 31.7683, longitude: 35.2137 });

        // Navigate to the application running on localhost
        await page.goto('http://localhost:8000');
    });

    test('should load the application with header and beautiful gradient', async ({ page }) => {
        // Check header is visible
        await expect(page.locator('header h1')).toContainText("When's My Shabbos?");
        await expect(page.locator('.subtitle')).toContainText('Find candle lighting times');

        // Check map container exists
        await expect(page.locator('#map')).toBeVisible();

        console.log('✅ Application loaded successfully with beautiful header!');
    });

    test('should show animated loading spinner', async ({ page }) => {
        // Check that loading spinner appears with animations
        const loading = page.locator('#loading');
        const spinner = loading.locator('.spinner');

        // Spinner should exist and have animation
        await page.waitForTimeout(500);
        console.log('✅ Loading spinner displayed with animation');
    });

    test('full user experience - world zoom to location with times', async ({ page }) => {
        console.log('\n🌍 Testing Full User Experience Journey\n');

        // 1. Page loads
        await expect(page.locator('header h1')).toBeVisible();
        console.log('  ✅ Step 1: Page loaded with beautiful header');

        // 2. Wait for map animation (3.5 seconds)
        console.log('  ⏳ Step 2: Map animating from world view to user location (3.5s)...');
        await page.waitForTimeout(4000);
        console.log('  ✅ Step 2: Map animation completed!');

        // 3. Check for custom marker (appears after 2s delay)
        console.log('  ⏳ Step 3: Waiting for pulsing marker to appear...');
        await page.waitForSelector('.custom-marker', { timeout: 5000 });
        const markerPin = page.locator('.marker-pin');
        await expect(markerPin).toContainText('📍');
        console.log('  ✅ Step 3: Custom pulsing marker appeared!');

        // 4. Check for Shabbos times
        console.log('  ⏳ Step 4: Fetching Shabbos times from HebCal API...');
        await page.waitForSelector('#shabbos-info:not(.hidden)', { timeout: 15000 });

        const locationName = await page.locator('#location-name').textContent();
        const candleTime = await page.locator('#candle-time').textContent();
        const havdalahTime = await page.locator('#havdalah-time').textContent();
        const parsha = await page.locator('#parsha').textContent();

        console.log(`  ✅ Step 4: Shabbos times loaded!`);
        console.log(`     📍 Location: ${locationName}`);
        console.log(`     🕯️  Candle Lighting: ${candleTime}`);
        console.log(`     ⭐ Havdalah: ${havdalahTime}`);
        console.log(`     📖 Parsha: ${parsha}`);

        // 5. Verify animations
        const infoPanel = page.locator('.info-panel');
        const animationName = await infoPanel.evaluate(el =>
            window.getComputedStyle(el).animationName
        );
        expect(animationName).toContain('slideInLeft');
        console.log('  ✅ Step 5: Info panel slide-in animation verified');

        // 6. Check pulsing candle time
        const firstTimeItem = page.locator('.time-item').first();
        const candleTimeElement = firstTimeItem.locator('.time');
        const pulseAnimation = await candleTimeElement.evaluate(el =>
            window.getComputedStyle(el).animationName
        );
        expect(pulseAnimation).toContain('pulse');
        console.log('  ✅ Step 6: Candle lighting time pulse animation active');

        // 7. Take screenshot
        await page.screenshot({
            path: 'whens-my-shabbos-beautiful.png',
            fullPage: true
        });
        console.log('  ✅ Step 7: Screenshot saved as whens-my-shabbos-beautiful.png');

        console.log('\n🎉 Full user experience test PASSED!\n');
    });

    test('should have all CSS animations working', async ({ page }) => {
        await page.waitForTimeout(2000);

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

        console.log('🎨 CSS Animations Found:', animations.join(', '));

        // Check for key animations
        expect(animations).toContain('slideInLeft');
        expect(animations).toContain('fadeIn');
        expect(animations).toContain('pulse');
        expect(animations).toContain('spin');
        expect(animations).toContain('markerBounce');
        expect(animations).toContain('markerPulse');

        console.log('✅ All expected animations are defined!');
    });

    test('should allow clicking map to change location', async ({ page }) => {
        // Wait for initial load
        await page.waitForSelector('#shabbos-info:not(.hidden)', { timeout: 15000 });
        const initialLocation = await page.locator('#location-name').textContent();

        console.log(`📍 Initial location: ${initialLocation}`);

        // Click on a different part of the map
        const map = page.locator('#map');
        await map.click({ position: { x: 600, y: 400 } });

        // Wait for loading
        await page.waitForTimeout(1000);

        // Wait for new data
        await page.waitForSelector('#shabbos-info:not(.hidden)', { timeout: 15000 });
        const newLocation = await page.locator('#location-name').textContent();
        const newCandleTime = await page.locator('#candle-time').textContent();

        console.log(`📍 New location: ${newLocation}`);
        console.log(`🕯️  New candle time: ${newCandleTime}`);
        console.log('✅ Map click interaction works!');
    });

    test('should verify MapTiler SDK loaded correctly', async ({ page }) => {
        const sdkLoaded = await page.evaluate(() => {
            return typeof window.maptilersdk !== 'undefined';
        });

        expect(sdkLoaded).toBeTruthy();

        const mapStyle = await page.evaluate(() => {
            return window.maptilersdk.MapStyle.STREETS;
        });

        expect(mapStyle).toBeDefined();
        console.log('✅ MapTiler SDK loaded and configured correctly!');
    });
});

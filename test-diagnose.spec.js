const { test, expect, chromium } = require('@playwright/test');

test.use({
    launchOptions: {
        args: [
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--disable-setuid-sandbox',
            '--no-sandbox',
            '--disable-web-security',
        ]
    }
});

test('diagnose white banner issue', async ({ page }) => {
    // Set up console logging
    const consoleMessages = [];
    page.on('console', msg => {
        consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    });

    // Grant geolocation
    await page.context().grantPermissions(['geolocation']);
    await page.context().setGeolocation({ latitude: 40.7128, longitude: -74.006 });

    // Navigate
    await page.goto('http://localhost:8000', { waitUntil: 'domcontentloaded', timeout: 10000 });

    // Wait a bit for map to load
    await page.waitForTimeout(3000);

    // Take screenshot of current state
    await page.screenshot({ path: 'diagnosis-initial.png', fullPage: true });

    // Check for any elements with white backgrounds
    const whiteElements = await page.evaluate(() => {
        const elements = [];
        const allElements = document.querySelectorAll('*');

        allElements.forEach(el => {
            const styles = window.getComputedStyle(el);
            const bg = styles.backgroundColor;
            const className = el.className;
            const id = el.id;

            // Check for white or near-white backgrounds
            if (bg === 'rgb(255, 255, 255)' || bg === 'rgba(255, 255, 255, 1)') {
                const rect = el.getBoundingClientRect();
                if (rect.width > 100 || rect.height > 100) { // Only large elements
                    elements.push({
                        tag: el.tagName,
                        className: className,
                        id: id,
                        bg: bg,
                        width: rect.width,
                        height: rect.height,
                        top: rect.top,
                        left: rect.left,
                        display: styles.display,
                        position: styles.position
                    });
                }
            }
        });

        return elements;
    });

    console.log('\n🔍 WHITE BACKGROUND ELEMENTS DETECTED:\n');
    whiteElements.forEach((el, idx) => {
        console.log(`${idx + 1}. ${el.tag}${el.className ? '.' + el.className : ''}${el.id ? '#' + el.id : ''}`);
        console.log(`   Size: ${el.width.toFixed(0)}x${el.height.toFixed(0)}px at (${el.left.toFixed(0)}, ${el.top.toFixed(0)})`);
        console.log(`   Position: ${el.position}, Display: ${el.display}`);
        console.log('');
    });

    // Check MapTiler/MapLibre specific elements
    const mapElements = await page.evaluate(() => {
        const elements = [];

        // Check all MapLibre/MapTiler classes
        const mapClasses = [
            'maplibregl-map',
            'maplibregl-canvas-container',
            'maplibregl-canvas',
            'maplibregl-ctrl-attrib',
            'maplibregl-ctrl-logo',
            'maplibregl-ctrl-top-right',
            'maplibregl-ctrl-top-left',
            'maplibregl-ctrl-bottom-right',
            'maplibregl-ctrl-bottom-left',
            'mapboxgl-map',
            'mapboxgl-canvas-container',
            'mapboxgl-canvas'
        ];

        mapClasses.forEach(cls => {
            const els = document.querySelectorAll('.' + cls);
            els.forEach(el => {
                const styles = window.getComputedStyle(el);
                const rect = el.getBoundingClientRect();
                elements.push({
                    class: cls,
                    bg: styles.backgroundColor,
                    width: rect.width,
                    height: rect.height,
                    top: rect.top,
                    zIndex: styles.zIndex
                });
            });
        });

        return elements;
    });

    console.log('\n🗺️  MAP ELEMENTS:\n');
    mapElements.forEach((el, idx) => {
        console.log(`${idx + 1}. .${el.class}`);
        console.log(`   Background: ${el.bg}`);
        console.log(`   Size: ${el.width.toFixed(0)}x${el.height.toFixed(0)}px`);
        console.log(`   z-index: ${el.zIndex}`);
        console.log('');
    });

    // Check all direct children of map container
    const mapContainerChildren = await page.evaluate(() => {
        const mapContainer = document.getElementById('map');
        if (!mapContainer) return [];

        const children = [];
        for (let child of mapContainer.children) {
            const styles = window.getComputedStyle(child);
            const rect = child.getBoundingClientRect();
            children.push({
                tag: child.tagName,
                className: child.className,
                bg: styles.backgroundColor,
                width: rect.width,
                height: rect.height,
                position: styles.position,
                zIndex: styles.zIndex
            });
        }
        return children;
    });

    console.log('\n📦 MAP CONTAINER CHILDREN:\n');
    mapContainerChildren.forEach((el, idx) => {
        console.log(`${idx + 1}. ${el.tag}${el.className ? '.' + el.className : ''}`);
        console.log(`   Background: ${el.bg}`);
        console.log(`   Size: ${el.width.toFixed(0)}x${el.height.toFixed(0)}px`);
        console.log(`   Position: ${el.position}, z-index: ${el.zIndex}`);
        console.log('');
    });

    // Print interesting console messages
    console.log('\n💬 CONSOLE MESSAGES:\n');
    consoleMessages.forEach(msg => {
        if (!msg.includes('DevTools')) {
            console.log(msg);
        }
    });

    console.log('\n✅ Diagnosis complete! Check diagnosis-initial.png for visual reference.\n');
});

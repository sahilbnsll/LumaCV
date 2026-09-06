async function checkRoutes() {
    const baseUrl = (process.argv[2] || process.env.TEST_APP_URL || 'http://localhost:3000').replace(/\/+$/, '');
    const routes = [
        '/',
        '/login',
        '/signup',
        '/forgot-password',
        '/reset-password',
        '/dashboard',
        '/builder',
        '/demo',
        '/billing',
        '/profile',
        '/terms',
        '/privacy',
        '/contact'
    ];

    console.log(`--- Verifying All Application Routes on ${baseUrl} ---`);
    let allOk = true;
    for (const route of routes) {
        try {
            const res = await fetch(`${baseUrl}${route}`);
            console.log(`GET ${route.padEnd(20)} -> ${res.status} ${res.statusText}`);
            if (res.status !== 200) allOk = false;
        } catch (err) {
            console.error(`GET ${route.padEnd(20)} -> ERROR:`, err.message);
            allOk = false;
        }
    }

    if (allOk) {
        console.log(`\n>>> SUCCESS: All 13 core application routes are healthy (200 OK) on ${baseUrl}!`);
    } else {
        console.error(`\n>>> FAILURE: Some routes did not return 200 OK on ${baseUrl}.`);
        process.exit(1);
    }
}

checkRoutes();

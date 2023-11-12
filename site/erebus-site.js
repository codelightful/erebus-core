Erebus.events.documentReady().then(function() {
    const contentArea = Erebus.$('#div_page_content');
    const sideBarArea = Erebus.$('#div_page_sidebar');
    sideBarArea.load('./site/fragments/sidebar.html');
    Erebus.controller.setTarget(contentArea);

    // Example of the regular routing without controllers
    Erebus.router.register('/', () => contentArea.load('./site/fragments/home.html'));
    // Example using a controller without action
    Erebus.router.register('quickstart', Erebus.controller({ fragment: './site/fragments/quickstart.html' }));
    // Example of dynamic routing using parameters from the hash
	Erebus.router.register('api/:section', (params) => contentArea.load(`./site/docs/${params.section}.html`));
    // Example of dynamic fragment using parameters from the hash
    Erebus.router.register('samples/:section', Erebus.controller({ fragment: (params) => `./site/samples/${params.section}.html` }));
    // Default routing using an example promise simulating a delayed loading
    Erebus.router.default(function() {
        return new Promise(function(resolve) {
            setTimeout(function() {
                console.log('Default router implementation');
                resolve();
            }, 3000);
        });
    });
    Erebus.router.start();
});
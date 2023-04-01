Erebus.events.onReady().then(function() {
    const contentArea = Erebus.element('#div_page_content');
    
    Erebus.router.register('/', () => contentArea.load('./site/fragments/home.html'));
    Erebus.router.register('quickstart', () => contentArea.load('./site/fragments/quickstart.html'));
	Erebus.router.register('api/:section', (params) => contentArea.load('./site/docs/' + params.section + '.html'));
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
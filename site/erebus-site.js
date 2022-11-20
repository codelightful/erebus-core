Erebus.events.documentReady().then(function() {
    function loadFragment(url) {
        return Erebus.http.get(url).then(function(response) {
            document.getElementById('div_page_content').innerHTML = response;
        }).catch(function(err) {

        });
    }

    Erebus.router.register('/', function() {
        return loadFragment('./site/fragments/home.html');
    });
    Erebus.router.register('quickstart', function() {
        return loadFragment('./site/fragments/quickstart.html');
    });
	Erebus.router.register('api/:section', function(params) {
        return loadFragment('./site/docs/' + params.section + '.html');
    });
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
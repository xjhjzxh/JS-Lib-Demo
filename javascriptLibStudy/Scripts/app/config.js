requirejs.config({ //234
    baseUrl: '/Scripts',
    paths: {
        jquery:"jquery-1.10.2",
        js:"app/js",
        app: 'app/app'
    }
});
require(["jquery"], function ($) {
    console.log("started");
    console.log($);
})
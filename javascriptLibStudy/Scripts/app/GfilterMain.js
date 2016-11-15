require(['jquery', 'util', 'gfilter'], function ($, u, g) {
    var common = u.common;
    window.a = {};
    a.GeoFilter = new g.CreateGeoFilter({
        config: {
            renderTo: "geoFilterInput"        
        }
    });
})
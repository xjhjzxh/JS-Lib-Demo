/// <autosync enabled="true" />//123123
/// <reference path="../ScriptsNew/require.js" data-main="ScriptsNew/main.js" />
require.config({
    paths: {
        "jquery": "lib/jquery-1.12.0.min",
        "util":"lib/util",
        "wangEditor": "lib/wangEditor-1.3.0.min",
        "scrollBar":"lib/perfect-scrollbar.jquery",
        "highChart":"lib/highcharts",
        "subscription": "app/subscription",
        "home_Menu": "app/homeMenu",
        "webFuncTips": "app/webFuncTips",
        "comment": "app/comment",
        "windowResize": "app/windowResize",
        "reportFilters": "app/reportFilters",
        "reportEngine": "app/reportEngine"
    },
    shim: {
        highCharts: {
            exports: "Highcharts",
            deps: ["jquery"]
        },
        //reportEngine: {
        //    deps:['jquery'],
        //    exports:'control'
        //},
        reportFilters: {
            deps:['jquery','highChart'],
            init: function () {
                return {
                    fc: fc,
                    common: common,
                    filterAction: filterAction
                }
            }
        }
    },
    urlArgs: "version=" + (new Date()).getTime(),
    baseUrl: "/ScriptsNew"
});

require(["jquery", "home_Menu", "windowResize", "reportEngine"], function ($, h, w, rE) {
    console.log($);
    //todo :document ready
    $(function () {
        h.init(); //home_menu initialization

        var c = new rE.control();
        c.init();
        

        //process the go to top function
        $("#totop").click(function () {
            //$("#contentForTable").scrollTop(0);
            //manaTop(0);
            var flag = "up";
            var fnScroll = function () {
                var tTotal = $("#contentForTable").scrollTop();
                if (flag == "up") {
                    tTotal -= 500;
                    if (tTotal <= 0) {
                        tTotal == 0;
                        flag = "stop";
                    }
                } else {
                    return;
                }
                $("#divHeader").css({ "top": tTotal < 0 ? 0 : tTotal + "px" });
                $("#contentForTable").scrollTop(tTotal);
                requestAnimationFrame(fnScroll);
            }
            fnScroll();
        })
    })
    $(window).resize(function () {
         w.init();
    })
});
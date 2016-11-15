define(["jquery"], function ($) {
    var AjaxGetData = {
        getData: function getData(baseURL, params, config, noCache) {
            var cacheKey;
            param = params || {};
            if (!baseURL) return;
            cacheKey = baseURL + JSON.stringify(params).hashCode();
            if (!noCache && (cache[cacheKey] !== undefined)) {
                return this.returnPromise("resolve", cache[cacheKey]);
            }
            return jQuery.when()
                         .then(function () {
                             config = config || {};
                             var url = baseURL, defaultConfig;
                             defaultConfig = {
                                 type: "post",
                                 url: url,
                                 data: params,
                                 traditional: true, //traditional parameters
                             }
                             jQuery.extend(defaultConfig, config);
                             return $.ajax(defaultConfig)
                                     .then(function (resolve) {
                                         if (!noCache) {
                                             cache[cacheKey] = resolve;
                                         }
                                         return AjaxGetData.returnPromise("resolve", resolve);
                                     })
                         })
        },
        returnPromise: function returnPromise(resolveReject, value) {
            var d = jQuery.Deferred();
            setTimeout(function () {
                d[resolveReject](value)
            }, 1);
            return d.promise();
        }
    }, cache = {},
    common = {
        init: (function () {
            String.prototype.hashCode = function () {
                var hash = 0, i, chr, len;
                if (this.length === 0) return hash;
                for (i = 0, len = this.length; i < len; i++) {
                    chr = this.charCodeAt(i);
                    hash = ((hash << 5) - hash) + chr;
                    hash |= 0; // Convert to 32bit integer
                }
                return hash;
            };
            String.prototype.trim = function () { return this.replace(/\s/g, ''); };
            String.prototype.thousandFormat = function () {
                var string = this + "";
                var re = /(-?\d+)(\d{3})/;
                while (re.test(string)) {
                    string = string.replace(re, "$1,$2");
                };
                return string;
            };            
            (function init() {
                window.uiConfig = {
                    "remBase": 16,
                    "isIe": false,
                };
                (function () {
                    if (!(window.ActiveXObject) && "ActiveXObject" in window) { //detect for ie under ie12
                        uiConfig.isIe = true;
                    }
                    else if (/x64|x32/ig.test(window.navigator.userAgent)) {    //detect for ie12
                        uiConfig.isIe = true;
                    }
                })()
            })();
            String.prototype.NoZoneDate = function () {
                var strDate = window.uiConfig.isIe ? "T00:00:00" : " 00:00:00";
                return new Date(this + strDate);
            }
        })(),
        formatComma: function formatComma(str, step, splitor) {
            var isNumber = /^\-?\d+(\.\d+)?$/;
            if (!isNumber.test(str)) return str;
            var str = str.toString(),
                ste = step || 3,
                regstr = "\\B(?=(\\d{" + ste + "})+(?!\\d))",
                reg = new RegExp(regstr, "g"),
                spli = splitor || ",",
                intstr = str.split('.')[0],
                fraction = str.split('.')[1] || "";
            return intstr.toString().replace(reg, spli) + (fraction && '.' + fraction);
            //

            str = str.toString();
            var len = str.length;
            if (len > step) {
                var l1 = len % step, l2 = Math.floor(len / step), arr = [], first = str.substr(0, l1);
                if (first != '') {
                    arr.push(first);
                };
                for (var i = 0; i < l2; i++) {
                    arr.push(str.substr(l1 + i * step, step));
                };
                str = arr.join(splitor);
            };
            return str;
        },
        withComma: function withComma(str) {
            var val = str;
            val = (val != null ? val : "");
            if (val === null || val === "") {
                return "";
            }
            val = Math.floor((val * 100)) / 100;
            //return val != null ? common.formatComma(val, 3, ',') : "";
            return val != null ? common.thousandFormat(str) : "";
        },
        thousandFormat: function (str) {
            var isNumber = /^\-?\d+(\.\d+)?$/;
            if (!isNumber.test(str)) return str;
            var str = str.toString(),
                ste = 3,
                regstr = "\\B(?=(\\d{3})+(?!\\d))",
                reg = new RegExp(regstr, "g"),
                spli = ",",
                intstr = str.split('.')[0],
                fraction = str.split('.')[1] || "";
            return intstr.toString().replace(reg, spli) + (fraction && '.' + fraction);
        },
        zoomText: function (str, defaultLength) {
            return str.length > defaultLength ? (defaultLength / str.length * 100 + "%") : "100%";
        },
        setRem: function () {
            document.documentElement.style.fontSize = window.innerWidth / 100 + "px";
            if (window.uiConfig) {
                window.uiConfig.remBase = window.innerWidth / 100;
            }
        },
        bayes: function (objArr) {
            if ($.isArray(objArr)) {
                var arr = jQuery.extend(true, [], objArr);
                arr.sort(function (i1, i2) { return i1[0] > i2[0] });
                return arr;
            }
        },
        loading: function () {

        },
        log: function (str) {
            console.log(str);
        },
        createEle: function (eleName, classlist, text, id, attr, data, style, events) {
            if (!eleName) return null;
            var ele, d = data;
            typeof eleName.nodeType == "undefined" ? ele = document.createElement(eleName) : ele = eleName;
            classlist && (!Array.isArray(classlist) ? (classlist.indexOf(' ') > 0 ? addClass(ele, classlist.split(' ')) : ele.classList.add(classlist)) : addClass(ele, classlist)),
            typeof id !== "undefined" && id !== null && ele.setAttribute("id", id),
            //typeof width !== "undefinde" && ele.setAttribute("style", "width:" + width + "px"),
            typeof text !== "undefined" && text != null && (ele.textContent = text);
            attr && typeof attr == "object" && (function () {
                var c;
                for (var c in attr) ele.setAttribute(c, attr[c])
            })(),
            data && jQuery(ele).data("d", d),
            style && typeof style == "object" && addStyle(ele, style);
            events && typeof events == "object" && bindEvents(ele, events);
            return ele;
            function addClass(ele, classArray) {
                for (var i = 0; i < classArray.length; i++) {
                    ele.classList.add(classArray[i]);
                }
            };
            function addStyle(ele, styleObj) {
                for (var s in styleObj) ele.style[s] = styleObj[s];
            }
            function bindEvents(ele, events) {
                for (var e in events) ele.addEventListener ? ele.addEventListener(e, events[e], false) : null;
            }
        },
        cEle: function (obj) {
            var ele = obj.ele || null,
                clist = obj.classlist || null,
                text = obj.text || null,
                id = obj.id || null,
                attr = obj.attr || null,
                data = obj.data || null,
                style = obj.style || null,
                events = obj.events || null;
            return common.createEle(ele, clist, text, id, attr, data, style, events);
        },
        cache: {
            id: 0,
            data: {},
            setCache: function (ele, key, value) {
                var d = value, thisCache;
                if (ele.nodeType) {
                    thisCache = ele["cacheId"] ? common.cache.data[ele["cacheId"]] || {} : (function () { ++common.cache.id, ele["cacheId"] = common.cache.id, common.cache.data[common.cache.id] = {}; return common.cache.data[common.cache.id]; })();

                    typeof common.cache.data[common.cache.id] === "undefined" && (common.cache.data[common.cache.id] = thisCache = {});
                    common.cache.data[common.cache.id][key] = d;
                    return common.cache.id;
                }
                else {
                    return null;
                }
            },
            getCache: function (ele, key) {
                id = ele["cacheId"];
                var o = common.cache.data[id][key];
                return o;
            },
            cache: function (ele, key, value) {
                if (arguments.length > 2)
                    return common.cache.setCache(ele, key, value);
                else if (arguments.length > 1)
                    return common.cache.getCache(ele, key);
                else
                    return;
            },
        },
        formatNumber: function (num) {
            num = num + "";
            var re = /(-?\d+)(\d{3})/;
            while (re.test(num)) {
                num = num.replace(re, "$1,$2");
            }
            return num;
        },
        getRatio: function () {
            var ratio = 0, screen = window.screen, ua = navigator.userAgent.toLowerCase();
            if (window.devicePixelRatio !== undefined) {
                ratio = window.devicePixelRatio;
            }
            else if (~ua.indexOf('msie')) {
                if (screen.deviceXDPI && screen.logicalXDPI) {
                    ratio = screen.deviceXDPI / screen.logicalXDPI;
                }
            }
            else if (window.outerWidth !== undefined && window.innerWidth !== undefined) {
                ratio = window.outerWidth / window.innerWidth;
            }
            if (ratio) {
                ratio = Math.round(ratio * 100);
            }
            return ratio;
        },
        checkZoom: function (close) {
            function getRatio() {
                var ratio = 0, screen = window.screen, ua = navigator.userAgent.toLowerCase();
                if (window.devicePixelRatio !== undefined) {
                    ratio = window.devicePixelRatio;
                }
                else if (~ua.indexOf('msie')) {
                    if (screen.deviceXDPI && screen.logicalXDPI) {
                        ratio = screen.deviceXDPI / screen.logicalXDPI;
                    }
                }
                else if (window.outerWidth !== undefined && window.innerWidth !== undefined) {
                    ratio = window.outerWidth / window.innerWidth;
                }
                if (ratio) {
                    ratio = Math.round(ratio * 100);
                }
                return ratio;
            }
            if (typeof close == "undefined") {
                var ratio = getRatio();
                if (ratio > 245 || ratio < 82) {
                    if (shouldNotice) {
                        $("#zoomNotice").slideDown(function () {
                            var height = $("#zoomNotice").height();
                            $("#zoomNotice").css("font-size", height / 4 + "px");
                            $("#zoomNoticetext").css("line-height", height + "px");
                            $("#zoomNoticetext").html('The Browser is zoomed too much. Press "CTRL + 0" to reset!');
                        });
                    }
                }
                else {
                    var height = $("#zoomNotice").height();
                    $("#zoomNotice").css("font-size", height / 4 + "px");
                    $("#zoomNoticetext").css("line-height", height + "px");
                    $("#zoomNotice").slideUp(function () {
                        $("#zoomNoticetext").html("");
                        //var height = $("#zoomNotice").height();
                        //$("#zoomNotice").css("font-size", height / 4 + "px").css("line-height", height + "px");
                    });
                }
            }
            else {
                shouldNotice = false;
                var height = $("#zoomNotice").height();
                $("#zoomNotice").css("font-size", height / 4 + "px");
                $("#zoomNoticetext").css("line-height", height + "px");
                $("#zoomNotice").slideUp(function () {
                    $("#zoomNotice").html("");
                    //var height = $("#zoomNotice").height();
                    //$("#zoomNotice").css("font-size", height / 4 + "px").css("line-height", height + "px");
                });
            }
        },
        getUrlParams: function (url, startSeparator) {
            var theRequest = new Object(), sep = startSeparator || "?";
            if (url.indexOf(sep) != -1) {
                try {
                    var str = url.substr(url.indexOf(sep) + 1);
                    if (str.length) {
                        var strs = str.split("&");
                        for (var i = 0; i < strs.length; i++) {
                            theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1].split('#')[0]);
                        }
                    }
                }
                catch (e) {
                    console.log("get params from url error", e);
                }
            }
            return theRequest;
        },
        setUrlParams: function (paramName, value, startSeparator) {
            var theRequest = new Object(), sep = startSeparator || "?", url = window.location.href, pageLink = url.substr(0, url.indexOf(sep));
            if (url.indexOf(sep) != -1 && url.split(sep)[1]) {
                var str = url.substr(url.indexOf(sep) + 1),
                    pageLink = pageLink + sep,
                    strs = str.split("&");
                for (var i = 0; i < strs.length; i++) {
                    if (strs[i].split("=")[0] === paramName) {
                        var paramArr = strs[i].split("=");
                        paramArr[1] = escape(value);
                        var paramstr = paramArr[0] + "=" + paramArr[1];
                        pageLink += i == 0 ? paramstr : "&" + paramstr;
                    }
                    else {
                        pageLink += i == 0 ? strs[i] : "&" + strs[i];
                    }
                };
                window.location.href = pageLink;
            }
            else {
                window.location.href = pageLink + sep + paramName + "=" + escape(value);
            };
        }
    };
    function getCon() {

    }
    return {
        AjaxGetData: AjaxGetData,
        common: common,
        cache: cache
    };
})



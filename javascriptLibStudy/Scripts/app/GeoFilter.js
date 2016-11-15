define(["jquery", "util"], function ($, util, scrollBar) {
    var common = util.common, AjaxGetData = util.AjaxGetData;
    var GEOFilter = new function () {
        this.CreateGeoFilter = function (obj) {
            if (!(this instanceof GEOFilter.CreateGeoFilter)) {
                return new GEOFilter.CreateGeoFilter(obj || {});
            };
            var me = this, defaltConfig = {
                multipelSelect: false,
                header: [
                    { "level": 1, "name": "WW" },
                    { "level": 2, "name": "Area" },
                    { "level": 3, "name": "Region" },
                    { "level": 4, "name": "Sub Region" },
                    { "level": 5, "name": "Subsidiary" },
                    { "level": 6, "name": "Country" }
                ],
                confirm: function () { },
                cancel: function () { },
                AfterInit: function () { },
                renderTo: null,     //  allow input id;
            };
            var config = me.config = $.extend(true, {}, defaltConfig, obj.config);
            me.height = window.innerHeight - 140;
            me.showed = false;
            me.filterAnimating = false;
            me.itemsArray = [];
            me.itemsLevel = {};
            me.itemsInAttr = {};

            //#region create Geo elements
            if (typeof config.renderTo == "string") {
                me.inputEle = document.getElementById(config.renderTo);
                if (!me.inputEle) {
                    console.log("Geo filter constructor cannot find target element");
                    return;
                }
            }
            me.parentElement = document.createElement("span");
            me.parentElement.id = "geofilter222";
            me.inputEle.parentNode.replaceChild(me.parentElement, me.inputEle);
            me.title = common.cEle({
                ele: "span",
                classlist:""
            })
            me.parentElement.appendChild(me.inputEle);
            var iptHeight = $(me.inputEle).outerHeight();
            $(me.inputEle).css({
                "width": $(me.inputEle).width() - iptHeight,
                "vertical-align": "top"
            });
            var dropIconBox = common.cEle({
                ele: "span",
                classlist: "geofilter-iconbox",
                attr: {
                    tabindex:"4"
                },
                style: {
                    width: iptHeight + "px",
                    height: iptHeight + "px",
                    "display": "inline-block"
                }
            })
            var dropIcon = common.cEle({
                ele: "i",
                classlist: "geofilter-icon"
            })
            dropIconBox.appendChild(dropIcon);
            me.parentElement.appendChild(dropIconBox);
            me.ele = common.cEle({
                ele: "div",
                classlist: ["GEOSelector", "filterSelector"],
                events: {
                    "click": function (event) {
                        var $clickedItem = $(event.target), id = $clickedItem.attr("data-id");
                        if ($clickedItem.hasClass("areaItem")) {
                            if ($(searchInputBox).attr("type") == "open") {
                                $(searchInputBox).attr("type", "");
                                $(searchInputBox).css({ "display": "none" });
                                $(searchInput).val("");
                            }
                            var areaItem = me.itemsInAttr[$clickedItem.attr("data-id")];
                            if (areaItem.status == "all") {
                                if (config.multipelSelect) {
                                    me.selector.delete(areaItem);
                                }
                            }
                            else if (areaItem.status == "half") {
                                if (config.multipelSelect) {
                                    me.selector.add($clickedItem.attr("data-id"));
                                }
                                else {
                                    me.selector.setSelectingList([]);
                                    me.updateAll();
                                    me.selector.add($clickedItem.attr("data-id"));
                                }
                            }
                            else {
                                if (config.multipelSelect) {
                                    me.selector.add($clickedItem.attr("data-id"));
                                }
                                else {
                                    me.selector.setSelectingList([]);
                                    me.updateAll();
                                    me.selector.add($clickedItem.attr("data-id"));
                                }
                            }
                        };
                    }
                }
            }); //GEOSelector     

            me.parentElement.appendChild(me.ele);
            me.ele.appendChild(common.cEle({
                ele: "div",
                classlist: "GeoFilterArrow"
            }));
            var mainBoxEle = common.cEle({
                ele: "div",
                classlist: "filterMainBox"
            });
            var headerEle = common.cEle({
                ele: "div",
                classlist: "filterMainHeader"
            });
            var selectedBoxEle = common.cEle({
                ele: "div",
                classlist: "filterSelected"
            });
            var searchBoxEle = common.cEle({
                ele: "div",
                classlist: "GeoFilterSearchBox"
            });
            var searchIconBox = common.cEle({
                ele: "span",
                classlist: "GeoFilterSearchIconBox",
                attr: {
                    tabindex: 4
                }
            });
            var searchIcon = common.cEle({
                ele: "i",
                classlist: "GeoFilterSearchIcon"
            });
            searchIconBox.appendChild(searchIcon);
            var searchInputBox = common.cEle({
                ele: "span",
                classlist: "GeoFilterSearchInputBox"
            });
            var searchInput = common.cEle({
                ele: "input",
                classlist: "GeoFilterSearchInput",
                attr: {
                    "tabindex": 4,//LiuDian,
                    "id": "GeoFilterSearchInput"
                }
            });
            searchInputBox.appendChild(searchInput);
            searchBoxEle.appendChild(searchIconBox);
            searchBoxEle.appendChild(searchInputBox);
            headerEle.appendChild(selectedBoxEle);
            headerEle.appendChild(searchBoxEle);
            headerEle.appendChild(common.cEle({
                ele: "div",
                style: { "clear": "both" }
            }));
            var contentPerfectScrollbarBox = common.cEle({
                ele: "div",
                classlist: ["geofilter_scrollbar_box", "ps-container", "ps-active-x", "ps-active-y"]
            })
            var contentBoxEle = common.cEle({
                ele: "div",
                classlist: "filterContent",
                style: {
                    'max-height': (me.height - 130) + "px",
                    'overflow': 'hidden',
                    'position': 'relative'
                }
            });
            var controlBoxEle = common.cEle({
                ele: "div",
                classlist: "geoFilterControlBox"
            });
            controlBoxEle.appendChild(common.cEle({
                ele: "div",
                classlist: "geoFilterSelect geoControlItem",
                text: "Select",
                attr: {
                    "tabindex": 4,//LiuDian
                },
                events: {
                    "click": function (event) {
                        me.selector.setSelectedList(me.selector.getSelectingList());
                        me.display(false);
                        config.confirm(me);
                    }
                }
            }));
            controlBoxEle.appendChild(common.cEle({
                ele: "div",
                classlist: "geoFilterSelect geoControlItem",
                text: "Cancel",
                attr: {
                    "tabindex": 4,//LiuDian
                },
                events: {
                    "click": function (event) {
                        me.display(false);
                        if ($(searchInputBox).attr("type") == "open") {
                            $(searchInputBox).attr("type", "");
                            $(searchInputBox).css({ "display": "none" });
                            $(searchInput).val("");
                        }
                        config.cancel(me);
                    }
                }
            }));
            mainBoxEle.appendChild(headerEle);
            mainBoxEle.appendChild(contentPerfectScrollbarBox);
            contentPerfectScrollbarBox.appendChild(contentBoxEle);
            mainBoxEle.appendChild(controlBoxEle);
            me.ele.appendChild(mainBoxEle);
            //#endregion

            me.regionBox = {
                regionBoxList: [],
                regionBoxLevel: 0,
                running: false,    //searching or updating
                afterRunning: [],
                update: function (geoObj) {
                    if (me.regionBox.running) me.regionBox.afterRunning.push(function () { me.regionBox.update(geoObj); });
                    me.regionBox.running = true;
                    var clickedItem = geoObj;
                    for (var i = 0; i < me.regionBox.regionBoxList.length; i++) {
                        if (i <= geoObj.level) {
                            me.regionBox.regionBoxList[i].ele.style.display = "block";
                        }
                        else {
                            me.regionBox.regionBoxList[i].ele.style.display = "none";
                        }
                    }
                    updateParent(geoObj);
                    function updateParent(geoObj) {
                        if (geoObj.ParentGEOKey) {
                            var obj = me.itemsInAttr[geoObj.ParentGEOKey], Level = obj["Level"];
                            me.regionBox.regionBoxList[Level].update(obj, clickedItem);
                            if (obj.ParentGEOKey) {
                                updateParent(obj);
                            }
                        }
                    }
                    if (geoObj.level < me.regionBox.regionBoxList.length) {
                        me.regionBox.regionBoxList[Number(geoObj.level)].update(geoObj, clickedItem);
                    }
                    me.regionBox.running = false;
                    for (var k = 0; k < me.regionBox.afterRunning.length; k++) {
                        typeof me.regionBox.afterRunning[k] == "function" && me.regionBox.afterRunning[k]();
                    };
                    //typeof $(contentBoxEle).perfectScrollbar() == "undefined" ? ($(contentBoxEle).perfectScrollbar()) : ($(contentBoxEle).perfectScrollbar('update'));
                },
                updateSearch: function (geoListAll) {
                    if (me.regionBox.running) me.regionBox.afterRunning[0] = function () { me.regionBox.update(geoObj); };
                    me.regionBox.running = true;
                    //templeate::geoListAll:{"1":[{wwItem}],"2":[{AreaItem},{AreaItem}],"3":[{regionItem},{regionItem}]}
                    for (var i = 1; i < me.regionBox.regionBoxList.length; i++) {
                        me.regionBox.regionBoxList[i].ele.style.display = "block";
                        me.regionBox.regionBoxList[i].updateByGeoList(geoListAll[i + 1]);
                    }
                    me.regionBox.running = false;
                    for (var k = 0; k < me.regionBox.afterRunning.length; k++) {
                        console.log("after running");
                        typeof me.regionBox.afterRunning[k] == "function" && me.regionBox.afterRunning[k]();
                    }
                    typeof $(contentBoxEle).perfectScrollbar() == "undefined" ? ($(contentBoxEle).perfectScrollbar()) : ($(contentBoxEle).perfectScrollbar('update'));
                },
                init: function () {
                    for (var i = 0; i < config.header.length; i++) {
                        var box = new me.regionBox.CreateRegionBox(config.header[i]);
                        me.regionBox.regionBoxList.push(box);
                        contentBoxEle.appendChild(box.ele);
                    }
                },
                CreateRegionBox: function (levelobj) {
                    //templeate::levelobj:{ "level": 2, "name": "Area" }
                    if (!(this instanceof me.regionBox.CreateRegionBox)) {
                        return new this.CreateRegionBox(level || { "level": 1, "name": "WW" });
                    };
                    //level = typeof level != "object" ? level : level.level;
                    this.parentGeoObj = null;
                    this.showed = false;
                    this.level = levelobj.level;
                    this.itemList = [];
                    this.levelName = levelobj.name;
                    this.ele = common.cEle({
                        ele: "div",
                        classlist: "regionClass regionLevel" + levelobj.level,
                        attr: {
                            "data-name": levelobj.name,
                            "data-level": levelobj.level
                        }
                    });
                    var title = common.cEle({
                        ele: "div",
                        classlist: "regionTitleClass"
                    });
                    this.ele.appendChild(title);

                    title.appendChild(common.cEle({
                        ele: "span",
                        classlist: "regionTitleClassText",
                        text: levelobj.name + " :"
                    }));
                    this.contentEle = common.cEle({
                        ele: "div",
                        classlist: "regionBodyClass"
                        //text: levelobj.name
                    });
                    this.ele.appendChild(this.contentEle);
                    this.update = function (obj, clickedItem) {
                        for (var j = 0; j < this.itemList.length; j++) {
                            var jtm = this.itemList[j];
                            if (jtm.GeoKey == clickedItem.GeoKey) continue;
                            jtm.viewFn(false);
                        };
                        var fragment = document.createDocumentFragment();
                        for (var i = 0; i < obj.children.length; i++) {
                            var item = obj.children[i];
                            var ele = item.viewFn(true);
                            ele && ele.nodeType == 1 && fragment.appendChild(ele);
                            this.itemList.push(item);
                        };
                        this.contentEle.appendChild(fragment);
                    };
                    this.updateByGeoList = function (geoItemsList) {
                        for (var j = 0; j < this.itemList.length; j++) {
                            var jtm = this.itemList[j];
                            jtm.viewFn(false);
                        };
                        var fragment = document.createDocumentFragment();
                        if (geoItemsList.length) {
                            for (var i = 0; i < geoItemsList.length; i++) {
                                var item = geoItemsList[i];
                                var ele = item.viewFn(true);
                                ele && ele.nodeType == 1 && fragment.appendChild(ele);
                                this.itemList.push(item);
                            };
                        }
                        this.contentEle.appendChild(fragment);
                    }
                    if (levelobj.level == 1) {
                        var ele = me.itemsInAttr["1"].viewFn(true);
                        ele && ele.nodeType == 1 && this.contentEle.appendChild(ele);
                        //this.itemList.push(me.itemsInAttr["1"]);
                    }
                    return this;
                }
            };
            me.selector = new function () {
                var selectingList = [], selectedList = [];
                function updateSelectedBox() {
                    $(selectedBoxEle).empty();
                    for (var i = 0; i < selectingList.length; i++) {
                        var elm = common.cEle({
                            ele: "div",
                            classlist: "areaSelectItem",
                            text: selectingList[i].name
                        });
                        if (config.multipelSelect) {
                            elm.appendChild(common.cEle({
                                ele: "img",
                                classlist: "areaItemAllSeletedIcon",
                                attr: {
                                    "src": "images/icons/delect.png",
                                    "data-id": selectingList[i]["id"],
                                },
                                events: {
                                    "click": function () {
                                        var id = $(this).attr("data-id");
                                        me.selector.delete(me.itemsInAttr[id]);
                                    }
                                }
                            }));
                        }
                        selectedBoxEle.appendChild(elm);
                    }
                };
                function CreateSelectedBoxItem(obj) {
                    var ele = common.cEle({
                        ele: "div",
                        classlist: "areaSelectItem " + obj.id,
                        text: obj.name,
                        attr: {
                            "data-name": obj.name,
                            "data-id": obj.id
                        }
                    });
                    ele.appendChild(common.cEle({
                        ele: "img",
                        classlist: "areaItemAllSeletedIcon " + obj.id,
                        attr: {
                            "src": "images/icons/delect.png",
                            "data-id": obj.id,
                        },
                        events: {
                            "click": function () {
                                me.selector.delete(obj);
                            }
                        }
                    }));
                }
                this.add = function (obj) {
                    var target = typeof obj == "object" ? obj : me.itemsInAttr[obj];
                    if (selectingList.filter(function (item) { return item.id == target.id }).length == 0) {
                        selectingList.push(target);
                        target.changeStatus("all");
                        me.regionBox.update(target);
                        updateSelectedBox();
                    }
                    else {
                        console.log("GEO Filter list error : Try to add an item which has already selected");
                    }
                };
                this.delete = function (obj) {
                    var target = typeof obj == "object" ? obj : me.itemsInAttr[obj];
                    selectingList = selectingList.filter(function (item) {
                        return item.id != target.id;
                    });
                    target.changeStatus("off");
                };
                this.getSelectedList = function () {
                    return selectedList;
                };
                this.setSelectedList = function (arr) {
                    selectedList = arr;
                };
                this.getSelectingList = function () {
                    return selectingList;
                }
                this.setSelectingList = function (arr) {
                    //selectingList = [];
                    ///clear all selecting items;
                    for (var j = 0, jlen = selectingList.length; j < jlen; j++) {
                        var target = selectingList[0];
                        if (!target) continue;
                        target.changeStatus('off');
                        selectingList = selectingList.filter(function (item) {
                            return item.id != target.id;
                        });
                    };
                    for (var i = 0; i < arr.length; i++) {
                        var item = arr[i];
                        if (typeof item == "object") {
                            this.add(item);
                        }
                        else {
                            this.add({ "id": item });
                        };
                    };
                    me.updateAll();
                }
                this.confirm = function () {
                    selectedList = selectingList;
                }
            }

            function customData() {
                for (var i = 0, iLen = me.itemsArray.length; i < iLen; i++) {
                    var obj = me.itemsArray[i];
                    GEOFilter.createGeoItem(obj, me);
                    me.itemsInAttr[obj.id] = obj;
                    if (!me.itemsLevel[obj.Level]) me.itemsLevel[obj.Level] = [];
                    me.itemsLevel[obj.Level].push(obj);
                };
                for (var j = 0, jLen = me.itemsArray.length; j < jLen; j++) {
                    var obj = me.itemsArray[j];
                    if (obj.parentId) {
                        me.itemsInAttr[obj["parentId"]]["children"].push(obj);
                    }
                }
            };
            function initDataToGeoObj() {

            };
            function getUrlParams() {

            };
            function initSelectedList() {
                //TODO:parse url params
                if (true) {

                }
                if (me.selector.getSelectedList().length == 0) {
                    me.selector.add(1);
                    me.selector.setSelectedList(me.selector.getSelectingList());
                }
            };
            if (obj && Array.isArray(obj)) {
                this.data = obj;
                init(this.data);
            }
            else {
                var promise = GEOFilter.getAreaMap(obj);
                promise.then(function (resolve) {
                    me.itemsArray = JSON.parse(resolve);
                    init();
                }, function () {
                    console.log("get geo map data faild !");
                    me.itemsArray = FY17GeoData;
                    init();
                })
            };

            function init() {
                customData();
                getUrlParams();
                me.regionBox.init();
                initSelectedList();
                $(me.ele).bind("transitionend webkitTransitionEnd msTransitionEnd oTransitionEnd", function () {
                    me.filterAnimating = false;
                    if (!me.showed) {
                        me.ele.style.display = "none";
                    }
                });
                $(searchIconBox).bind("click", function () {
                    if ($(searchInputBox).attr("type") != "open") {
                        $(searchInputBox).css('display', 'inline-block');
                        $(searchInputBox).attr("type", "open");
                        $(searchInput).focus();
                    }
                    else {
                        $(searchInputBox).attr("type", "");
                    }
                });
                $(searchIconBox).bind("transitionend webkitTransitionEnd msTransitionEnd oTransitionEnd", function () {
                    if ($(searchInputBox).attr("type") != "open") {
                        $(searchInputBox).css("display", "none");
                    }
                });
                $(searchInput).bind("keyup", function (event) {
                    me.search($(this).val());
                })
                $(document).bind('mousedown', function (event) {
                    if (!$(event.target).closest(".GEOSelector").length && !$(event.target).closest(".filterGeoInputDiv").length) {
                        me.display(false);
                    }
                });
                $(document).bind('keyup', function (event) {
                    if (!$(event.target).closest(".GEOSelector").length && !$(event.target).closest(".filterGeoInputDiv").length) {
                        me.display(false);
                    }
                })
                $(document).bind('keydown', function (event) {
                    if (!me.showed) return;
                    var keyvalue = event.keyCode || event.which;
                    if (keyvalue === 27) {  //press ESC
                        me.display(false);
                    }
                    if (document.activeElement.id !== "GeoFilterSearchInput") {
                        if ((keyvalue >= 48 && keyvalue <= 57) || (keyvalue >= 65 && keyvalue <= 90)) {
                            $(searchInputBox).attr("type", "open");
                            $(searchInputBox).css({ "display": "inline-block" });
                            $(searchInput).focus();
                        }
                    }
                });
                $(window).resize(function () {
                    me.height = window.innerHeight - 140;
                    $(me.ele).css('max-height', me.height);
                    $(contentBoxEle).css("max-height", me.height - 130);
                    $(contentBoxEle).perfectScrollbar('update');
                });
                me.config.AfterInit();
            };
        },

        this.CreateGeoFilter.prototype.updateAll = function () {
            for (var i = 0; i < this.itemsArray.length; i++) {
                var obj = this.itemsArray[i];
                obj.changeStatus("off");
            };
            if (this.selector.getSelectedList() > 0) {
                for (var j = 0; j < this.selector.getSelectedList() ; j++) {
                    this.selector.getSelectedList()[j].changeStatus("all");
                }
            }
        };
        this.CreateGeoFilter.prototype.search = function (query) {
            var me = this, matchedItems = {}; //matchedItems:{"1":[{wwItem}],"2":[{AreaItem},{AreaItem}],"3":[{regionItem},{regionItem}]}
            for (var i = 0; i < me.config.header.length; i++) {
                var headerItem = me.config.header[i];
                me.itemsLevel[headerItem.level]
                matchedItems[headerItem.level] = me.itemsLevel[headerItem.level].filter(function (item, i, a) {
                    var reg = new RegExp(query, "ig");
                    return !!item.Name.match(reg);
                })
            }
            me.regionBox.updateSearch(matchedItems);
        };
        this.CreateGeoFilter.prototype.destory = function () {

        };
        this.CreateGeoFilter.prototype.show = function () {
            var me = this;
            this.showed = true;
            this.filterAnimating = true;
            this.ele.style.display = "block";
            setTimeout(function () {
                me.ele.style.maxHeight = me.height + "px";
            }, 100);
        };
        this.CreateGeoFilter.prototype.hide = function () {
            this.ele.style.maxHeight = "0px";
            this.filterAnimating = true;
            this.showed = false;
            this.config.cancel(this);
        };
        this.CreateGeoFilter.prototype.display = function (toShow) {
            if (typeof toShow != "undefined") {
                toShow ? this.show() : this.hide();
            }
            else {
                if (!this.showed) {
                    this.show();
                }
                else {
                    this.hide();
                }
            }
            return this.showed;
        }
        this.createGeoItem = function (obj, menu) {
            try {
                obj.hasOwnProperty("Name") && (obj.name = obj.Name = obj.Name);
                obj.hasOwnProperty("GeoKey") && (obj.id = obj.GEOKey = obj.GeoKey);
                obj.hasOwnProperty("Level") && (obj.level = obj.Level = obj.Level);
                obj.hasOwnProperty("ParentGEOKey") ? (obj.parentId = obj.parentGEOKey = obj.ParentGEOKey) : (obj.parentId = obj.parentGEOKey = null);
                obj.status = null,
                obj.showed = false,
                obj.viewObj = null,
                obj.children = [],
                obj.selectedChildren = [],
                obj.filter = menu;
                obj.viewFn = function (show, parentId) {
                    var elm = null;
                    if (show) {
                        if (obj.showed)
                            return null;
                        var itemClass = "";
                        switch (this.status) {
                            case "all":
                                itemClass = "areaItem areaItemAllFocus " + obj.id;
                                break;
                            case "half":
                                itemClass = "areaItem areaItemHalfFocus " + obj.id;
                                break;
                            default:
                                itemClass = "areaItem " + obj.id;
                                break;
                        }
                        //var curItem = this;
                        if (this.viewObj) {
                            this.viewObj.show();
                            obj.showed = true;
                            return true;
                        }
                        elm = common.cEle({
                            ele: "div",
                            classlist: itemClass,
                            text: this.name,
                            attr: {
                                "data-id": obj.id,
                                "tabindex": 4,//LiuDian
                            }
                        });
                        elm.appendChild(common.cEle({
                            ele: "img",
                            classlist: "areaItemAllFocusIcon",
                            attr: {
                                src: "images/icons/select.png"
                            }
                        }));
                        obj.showed = true;
                        obj.viewObj = $(elm);
                    }
                    else {
                        if (!obj.showed)
                            return;
                        //obj.viewObj && obj.viewObj.remove();
                        if (obj.viewObj) {
                            obj.showed = false;
                            obj.viewObj.hide();
                            return false;
                        };
                        //obj.viewObj = null;
                    }
                    return elm;
                };
                obj.changeStatus = function (val) {
                    switch (val) {
                        case "all":
                            var defaultClass = "areaItem areaItemAllFocus " + this.id;
                            this.status = val;
                            if (this.viewObj)   // check if element has been created!
                                this.viewObj.hasClass("areaItemAllFocus") ? "" : this.viewObj.removeClass(), this.viewObj.addClass(defaultClass);
                            if (this.parentId) {
                                this.filter.itemsInAttr[this.parentId].changeStatus("half");
                            };
                            break;
                        case "half":
                            var defaultClass = "areaItem areaItemHalfFocus " + this.id;
                            //if (this.level == "1") {
                            this.status = val;
                            if (this.viewObj)
                                this.viewObj.hasClass("areaItemHalfFocus") ? "" : this.viewObj.removeClass(), this.viewObj.addClass(defaultClass);
                            if (this.parentId)
                                this.filter.itemsInAttr[this.parentId].changeStatus("half");
                            //};
                            break;
                        default:
                            var defaultClass = "areaItem " + this.id;
                            this.status = val;
                            if (this.viewObj)
                                this.viewObj.removeClass(), this.viewObj.addClass(defaultClass);
                            break;
                    }
                };
            } catch (e) {
                console.log("Create geo Item error :" + e.stack);
            }
        },
        this.getAreaMap = function (obj) {
            var url = obj && obj.url ? obj.url : "http://cia-sh-09:8888/DXAED/DXGetAreaCountryMap.srv?action=GetFY17AreaMap";
            return AjaxGetData.getData(url, null, {}, false);
        }
    }
    return GEOFilter;
})

var FY17GeoData = [{ "Name": "WW", "GeoKey": "1", "Level": "1", "ParentGEOKey": "" }, { "Name": "APAC", "GeoKey": "2", "Level": "2", "ParentGEOKey": "1" }, { "Name": "Canada", "GeoKey": "89", "Level": "2", "ParentGEOKey": "1" }, { "Name": "Central and Eastern Europe", "GeoKey": "96", "Level": "2", "ParentGEOKey": "1" }, { "Name": "France", "GeoKey": "202", "Level": "2", "ParentGEOKey": "1" }, { "Name": "Germany", "GeoKey": "208", "Level": "2", "ParentGEOKey": "1" }, { "Name": "Greater China", "GeoKey": "213", "Level": "2", "ParentGEOKey": "1" }, { "Name": "India", "GeoKey": "232", "Level": "2", "ParentGEOKey": "1" }, { "Name": "Japan", "GeoKey": "240", "Level": "2", "ParentGEOKey": "1" }, { "Name": "Latam", "GeoKey": "245", "Level": "2", "ParentGEOKey": "1" }, { "Name": "MEA", "GeoKey": "357", "Level": "2", "ParentGEOKey": "1" }, { "Name": "UK", "GeoKey": "513", "Level": "2", "ParentGEOKey": "1" }, { "Name": "United States", "GeoKey": "521", "Level": "2", "ParentGEOKey": "1" }, { "Name": "Western Europe", "GeoKey": "531", "Level": "2", "ParentGEOKey": "1" }, { "Name": "Unknown", "GeoKey": "595", "Level": "2", "ParentGEOKey": "1" }, { "Name": "APAC Judgment", "GeoKey": "669", "Level": "3", "ParentGEOKey": "2" }, { "Name": "Argentina & Uruguay", "GeoKey": "246", "Level": "3", "ParentGEOKey": "245" }, { "Name": "Asia Pacific HQ", "GeoKey": "673", "Level": "3", "ParentGEOKey": "2" }, { "Name": "Australia", "GeoKey": "7", "Level": "3", "ParentGEOKey": "2" }, { "Name": "Austria", "GeoKey": "532", "Level": "3", "ParentGEOKey": "531" }, { "Name": "Belgium", "GeoKey": "536", "Level": "3", "ParentGEOKey": "531" }, { "Name": "Brazil", "GeoKey": "258", "Level": "3", "ParentGEOKey": "245" }, { "Name": "Canada", "GeoKey": "90", "Level": "3", "ParentGEOKey": "89" }, { "Name": "CEE Cluster 2", "GeoKey": "97", "Level": "3", "ParentGEOKey": "96" }, { "Name": "CEE Multi Country Region", "GeoKey": "121", "Level": "3", "ParentGEOKey": "96" }, { "Name": "Central and Eastern Europe Judgment", "GeoKey": "642", "Level": "3", "ParentGEOKey": "96" }, { "Name": "Chile", "GeoKey": "262", "Level": "3", "ParentGEOKey": "245" }, { "Name": "China", "GeoKey": "214", "Level": "3", "ParentGEOKey": "213" }, { "Name": "Colombia", "GeoKey": "266", "Level": "3", "ParentGEOKey": "245" }, { "Name": "Denmark", "GeoKey": "542", "Level": "3", "ParentGEOKey": "531" }, { "Name": "Egypt", "GeoKey": "358", "Level": "3", "ParentGEOKey": "357" }, { "Name": "Finland", "GeoKey": "550", "Level": "3", "ParentGEOKey": "531" }, { "Name": "France", "GeoKey": "203", "Level": "3", "ParentGEOKey": "202" }, { "Name": "GCR excl China", "GeoKey": "218", "Level": "3", "ParentGEOKey": "213" }, { "Name": "Germany", "GeoKey": "209", "Level": "3", "ParentGEOKey": "208" }, { "Name": "Greater China Judgment", "GeoKey": "647", "Level": "3", "ParentGEOKey": "213" }, { "Name": "Gulf", "GeoKey": "362", "Level": "3", "ParentGEOKey": "357" }, { "Name": "India", "GeoKey": "233", "Level": "3", "ParentGEOKey": "232" }, { "Name": "Indonesia", "GeoKey": "35", "Level": "3", "ParentGEOKey": "2" }, { "Name": "Ireland", "GeoKey": "555", "Level": "3", "ParentGEOKey": "531" }, { "Name": "Israel", "GeoKey": "381", "Level": "3", "ParentGEOKey": "357" }, { "Name": "Italy", "GeoKey": "559", "Level": "3", "ParentGEOKey": "531" }, { "Name": "Japan", "GeoKey": "241", "Level": "3", "ParentGEOKey": "240" }, { "Name": "Korea", "GeoKey": "41", "Level": "3", "ParentGEOKey": "2" }, { "Name": "Latam Judgment", "GeoKey": "651", "Level": "3", "ParentGEOKey": "245" }, { "Name": "Latam New Markets", "GeoKey": "278", "Level": "3", "ParentGEOKey": "245" }, { "Name": "Latin America HQ", "GeoKey": "655", "Level": "3", "ParentGEOKey": "245" }, { "Name": "Malaysia", "GeoKey": "48", "Level": "3", "ParentGEOKey": "2" }, { "Name": "MEA Judgment", "GeoKey": "659", "Level": "3", "ParentGEOKey": "357" }, { "Name": "Mexico", "GeoKey": "349", "Level": "3", "ParentGEOKey": "245" }, { "Name": "NEPA Emerging Region", "GeoKey": "389", "Level": "3", "ParentGEOKey": "357" }, { "Name": "Netherlands", "GeoKey": "565", "Level": "3", "ParentGEOKey": "531" }, { "Name": "New Zealand", "GeoKey": "52", "Level": "3", "ParentGEOKey": "2" }, { "Name": "Nigeria", "GeoKey": "630", "Level": "3", "ParentGEOKey": "357" }, { "Name": "Norway", "GeoKey": "569", "Level": "3", "ParentGEOKey": "531" }, { "Name": "Philippines", "GeoKey": "58", "Level": "3", "ParentGEOKey": "2" }, { "Name": "Portugal", "GeoKey": "576", "Level": "3", "ParentGEOKey": "531" }, { "Name": "Russia", "GeoKey": "187", "Level": "3", "ParentGEOKey": "96" }, { "Name": "Saudi Arabia", "GeoKey": "425", "Level": "3", "ParentGEOKey": "357" }, { "Name": "SEA Emerging Region", "GeoKey": "62", "Level": "3", "ParentGEOKey": "2" }, { "Name": "Singapore", "GeoKey": "80", "Level": "3", "ParentGEOKey": "2" }, { "Name": "South Africa", "GeoKey": "429", "Level": "3", "ParentGEOKey": "357" }, { "Name": "Spain", "GeoKey": "580", "Level": "3", "ParentGEOKey": "531" }, { "Name": "Sweden", "GeoKey": "586", "Level": "3", "ParentGEOKey": "531" }, { "Name": "Switzerland", "GeoKey": "590", "Level": "3", "ParentGEOKey": "531" }, { "Name": "Thailand", "GeoKey": "84", "Level": "3", "ParentGEOKey": "2" }, { "Name": "Turkey", "GeoKey": "435", "Level": "3", "ParentGEOKey": "357" }, { "Name": "UK", "GeoKey": "514", "Level": "3", "ParentGEOKey": "513" }, { "Name": "United States", "GeoKey": "522", "Level": "3", "ParentGEOKey": "521" }, { "Name": "Vietnam", "GeoKey": "631", "Level": "3", "ParentGEOKey": "2" }, { "Name": "WECA Emerging Region", "GeoKey": "439", "Level": "3", "ParentGEOKey": "357" }, { "Name": "Western Europe Judgment", "GeoKey": "663", "Level": "3", "ParentGEOKey": "531" }, { "Name": "Unknown", "GeoKey": "596", "Level": "3", "ParentGEOKey": "595" }, { "Name": "APAC_Unknown", "GeoKey": "10001", "Level": "3", "ParentGEOKey": "2" }, { "Name": "Canada_Unknown", "GeoKey": "10002", "Level": "3", "ParentGEOKey": "89" }, { "Name": "Central and Eastern Europe_Unknown", "GeoKey": "10003", "Level": "3", "ParentGEOKey": "96" }, { "Name": "France_Unknown", "GeoKey": "10004", "Level": "3", "ParentGEOKey": "202" }, { "Name": "Germany_Unknown", "GeoKey": "10005", "Level": "3", "ParentGEOKey": "208" }, { "Name": "Greater China_Unknown", "GeoKey": "10006", "Level": "3", "ParentGEOKey": "213" }, { "Name": "India_Unknown", "GeoKey": "10007", "Level": "3", "ParentGEOKey": "232" }, { "Name": "Japan_Unknown", "GeoKey": "10008", "Level": "3", "ParentGEOKey": "240" }, { "Name": "Latam_Unknown", "GeoKey": "10009", "Level": "3", "ParentGEOKey": "245" }, { "Name": "MEA_Unknown", "GeoKey": "10010", "Level": "3", "ParentGEOKey": "357" }, { "Name": "UK_Unknown", "GeoKey": "10011", "Level": "3", "ParentGEOKey": "513" }, { "Name": "United States_Unknown", "GeoKey": "10012", "Level": "3", "ParentGEOKey": "521" }, { "Name": "Western Europe_Unknown", "GeoKey": "10013", "Level": "3", "ParentGEOKey": "531" }, { "Name": "APAC Judgment", "GeoKey": "670", "Level": "4", "ParentGEOKey": "669" }, { "Name": "Argentina & Uruguay", "GeoKey": "247", "Level": "4", "ParentGEOKey": "246" }, { "Name": "Asia Pacific HQ", "GeoKey": "674", "Level": "4", "ParentGEOKey": "673" }, { "Name": "Australia", "GeoKey": "8", "Level": "4", "ParentGEOKey": "7" }, { "Name": "Austria", "GeoKey": "533", "Level": "4", "ParentGEOKey": "532" }, { "Name": "Belgium", "GeoKey": "537", "Level": "4", "ParentGEOKey": "536" }, { "Name": "Brazil", "GeoKey": "259", "Level": "4", "ParentGEOKey": "258" }, { "Name": "Canada", "GeoKey": "91", "Level": "4", "ParentGEOKey": "90" }, { "Name": "CEE MC CIS", "GeoKey": "132", "Level": "4", "ParentGEOKey": "121" }, { "Name": "CEE MC Europe", "GeoKey": "118", "Level": "4", "ParentGEOKey": "121" }, { "Name": "Central and Eastern Europe Judgment", "GeoKey": "643", "Level": "4", "ParentGEOKey": "642" }, { "Name": "Chile", "GeoKey": "263", "Level": "4", "ParentGEOKey": "262" }, { "Name": "China", "GeoKey": "215", "Level": "4", "ParentGEOKey": "214" }, { "Name": "Colombia", "GeoKey": "267", "Level": "4", "ParentGEOKey": "266" }, { "Name": "Denmark", "GeoKey": "543", "Level": "4", "ParentGEOKey": "542" }, { "Name": "Egypt", "GeoKey": "359", "Level": "4", "ParentGEOKey": "358" }, { "Name": "Finland", "GeoKey": "551", "Level": "4", "ParentGEOKey": "550" }, { "Name": "France", "GeoKey": "204", "Level": "4", "ParentGEOKey": "203" }, { "Name": "Germany", "GeoKey": "210", "Level": "4", "ParentGEOKey": "209" }, { "Name": "Greater China Judgment", "GeoKey": "648", "Level": "4", "ParentGEOKey": "647" }, { "Name": "Greece", "GeoKey": "101", "Level": "4", "ParentGEOKey": "97" }, { "Name": "Hong Kong", "GeoKey": "219", "Level": "4", "ParentGEOKey": "218" }, { "Name": "Hungary", "GeoKey": "104", "Level": "4", "ParentGEOKey": "97" }, { "Name": "India", "GeoKey": "234", "Level": "4", "ParentGEOKey": "233" }, { "Name": "Indonesia", "GeoKey": "36", "Level": "4", "ParentGEOKey": "35" }, { "Name": "Ireland", "GeoKey": "556", "Level": "4", "ParentGEOKey": "555" }, { "Name": "Israel", "GeoKey": "382", "Level": "4", "ParentGEOKey": "381" }, { "Name": "Italy", "GeoKey": "560", "Level": "4", "ParentGEOKey": "559" }, { "Name": "Japan", "GeoKey": "242", "Level": "4", "ParentGEOKey": "241" }, { "Name": "Korea", "GeoKey": "42", "Level": "4", "ParentGEOKey": "41" }, { "Name": "Kuwait", "GeoKey": "366", "Level": "4", "ParentGEOKey": "362" }, { "Name": "Latam Judgment", "GeoKey": "652", "Level": "4", "ParentGEOKey": "651" }, { "Name": "Latam New Markets", "GeoKey": "279", "Level": "4", "ParentGEOKey": "278" }, { "Name": "Latin America HQ", "GeoKey": "656", "Level": "4", "ParentGEOKey": "655" }, { "Name": "Malaysia", "GeoKey": "49", "Level": "4", "ParentGEOKey": "48" }, { "Name": "MEA Judgment", "GeoKey": "660", "Level": "4", "ParentGEOKey": "659" }, { "Name": "Mexico", "GeoKey": "350", "Level": "4", "ParentGEOKey": "349" }, { "Name": "NEPA Emerging SubRegion", "GeoKey": "396", "Level": "4", "ParentGEOKey": "389" }, { "Name": "Netherlands", "GeoKey": "566", "Level": "4", "ParentGEOKey": "565" }, { "Name": "New Zealand", "GeoKey": "53", "Level": "4", "ParentGEOKey": "52" }, { "Name": "Nigeria", "GeoKey": "466", "Level": "4", "ParentGEOKey": "630" }, { "Name": "Norway", "GeoKey": "570", "Level": "4", "ParentGEOKey": "569" }, { "Name": "Oman and Bahrain", "GeoKey": "369", "Level": "4", "ParentGEOKey": "362" }, { "Name": "Philippines", "GeoKey": "59", "Level": "4", "ParentGEOKey": "58" }, { "Name": "Poland", "GeoKey": "107", "Level": "4", "ParentGEOKey": "97" }, { "Name": "Portugal", "GeoKey": "577", "Level": "4", "ParentGEOKey": "576" }, { "Name": "Qatar", "GeoKey": "374", "Level": "4", "ParentGEOKey": "362" }, { "Name": "Romania", "GeoKey": "110", "Level": "4", "ParentGEOKey": "97" }, { "Name": "Russia", "GeoKey": "188", "Level": "4", "ParentGEOKey": "187" }, { "Name": "Saudi Arabia", "GeoKey": "426", "Level": "4", "ParentGEOKey": "425" }, { "Name": "SEA New Markets", "GeoKey": "63", "Level": "4", "ParentGEOKey": "62" }, { "Name": "Singapore", "GeoKey": "81", "Level": "4", "ParentGEOKey": "80" }, { "Name": "Slovakia and Czech Republic", "GeoKey": "98", "Level": "4", "ParentGEOKey": "97" }, { "Name": "South Africa", "GeoKey": "430", "Level": "4", "ParentGEOKey": "429" }, { "Name": "Spain", "GeoKey": "581", "Level": "4", "ParentGEOKey": "580" }, { "Name": "Sweden", "GeoKey": "587", "Level": "4", "ParentGEOKey": "586" }, { "Name": "Switzerland", "GeoKey": "591", "Level": "4", "ParentGEOKey": "590" }, { "Name": "Taiwan", "GeoKey": "225", "Level": "4", "ParentGEOKey": "218" }, { "Name": "Thailand", "GeoKey": "85", "Level": "4", "ParentGEOKey": "84" }, { "Name": "Turkey", "GeoKey": "436", "Level": "4", "ParentGEOKey": "435" }, { "Name": "UK", "GeoKey": "515", "Level": "4", "ParentGEOKey": "514" }, { "Name": "United Arab Emirates", "GeoKey": "377", "Level": "4", "ParentGEOKey": "362" }, { "Name": "United States", "GeoKey": "523", "Level": "4", "ParentGEOKey": "522" }, { "Name": "Vietnam", "GeoKey": "73", "Level": "4", "ParentGEOKey": "631" }, { "Name": "WECA Emerging SubRegion", "GeoKey": "443", "Level": "4", "ParentGEOKey": "439" }, { "Name": "Western Europe Judgment", "GeoKey": "664", "Level": "4", "ParentGEOKey": "663" }, { "Name": "Unknown", "GeoKey": "597", "Level": "4", "ParentGEOKey": "596" }, { "Name": "APAC_Unknown", "GeoKey": "10014", "Level": "4", "ParentGEOKey": "10001" }, { "Name": "Canada_Unknown", "GeoKey": "10015", "Level": "4", "ParentGEOKey": "10002" }, { "Name": "Central and Eastern Europe_Unknown", "GeoKey": "10016", "Level": "4", "ParentGEOKey": "10003" }, { "Name": "France_Unknown", "GeoKey": "10017", "Level": "4", "ParentGEOKey": "10004" }, { "Name": "Germany_Unknown", "GeoKey": "10018", "Level": "4", "ParentGEOKey": "10005" }, { "Name": "Greater China_Unknown", "GeoKey": "10019", "Level": "4", "ParentGEOKey": "10006" }, { "Name": "India_Unknown", "GeoKey": "10020", "Level": "4", "ParentGEOKey": "10007" }, { "Name": "Japan_Unknown", "GeoKey": "10021", "Level": "4", "ParentGEOKey": "10008" }, { "Name": "Latam_Unknown", "GeoKey": "10022", "Level": "4", "ParentGEOKey": "10009" }, { "Name": "MEA_Unknown", "GeoKey": "10023", "Level": "4", "ParentGEOKey": "10010" }, { "Name": "UK_Unknown", "GeoKey": "10024", "Level": "4", "ParentGEOKey": "10011" }, { "Name": "United States_Unknown", "GeoKey": "10025", "Level": "4", "ParentGEOKey": "10012" }, { "Name": "Western Europe_Unknown", "GeoKey": "10026", "Level": "4", "ParentGEOKey": "10013" }, { "Name": "Africa New Markets", "GeoKey": "625", "Level": "5", "ParentGEOKey": "443" }, { "Name": "Albania", "GeoKey": "133", "Level": "5", "ParentGEOKey": "118" }, { "Name": "Algeria", "GeoKey": "391", "Level": "5", "ParentGEOKey": "396" }, { "Name": "Angola", "GeoKey": "446", "Level": "5", "ParentGEOKey": "443" }, { "Name": "APAC Judgment", "GeoKey": "671", "Level": "5", "ParentGEOKey": "670" }, { "Name": "Argentina", "GeoKey": "248", "Level": "5", "ParentGEOKey": "247" }, { "Name": "Armenia", "GeoKey": "135", "Level": "5", "ParentGEOKey": "132" }, { "Name": "Asia Pacific HQ", "GeoKey": "675", "Level": "5", "ParentGEOKey": "674" }, { "Name": "Australia", "GeoKey": "9", "Level": "5", "ParentGEOKey": "8" }, { "Name": "Austria", "GeoKey": "534", "Level": "5", "ParentGEOKey": "533" }, { "Name": "Azerbaijan", "GeoKey": "137", "Level": "5", "ParentGEOKey": "132" }, { "Name": "Bahrain", "GeoKey": "370", "Level": "5", "ParentGEOKey": "369" }, { "Name": "Bangladesh", "GeoKey": "64", "Level": "5", "ParentGEOKey": "63" }, { "Name": "BCCBBJ", "GeoKey": "280", "Level": "5", "ParentGEOKey": "279" }, { "Name": "Belarus", "GeoKey": "139", "Level": "5", "ParentGEOKey": "132" }, { "Name": "Belgium", "GeoKey": "538", "Level": "5", "ParentGEOKey": "537" }, { "Name": "Bolivia", "GeoKey": "287", "Level": "5", "ParentGEOKey": "279" }, { "Name": "Bosnia and Herzegovina", "GeoKey": "141", "Level": "5", "ParentGEOKey": "118" }, { "Name": "Brazil", "GeoKey": "260", "Level": "5", "ParentGEOKey": "259" }, { "Name": "Brunei", "GeoKey": "67", "Level": "5", "ParentGEOKey": "63" }, { "Name": "Bulgaria", "GeoKey": "130", "Level": "5", "ParentGEOKey": "118" }, { "Name": "Cambodia", "GeoKey": "639", "Level": "5", "ParentGEOKey": "63" }, { "Name": "Canada", "GeoKey": "92", "Level": "5", "ParentGEOKey": "91" }, { "Name": "Central and Eastern Europe Judgment", "GeoKey": "644", "Level": "5", "ParentGEOKey": "643" }, { "Name": "Central Asia", "GeoKey": "144", "Level": "5", "ParentGEOKey": "132" }, { "Name": "Chile", "GeoKey": "264", "Level": "5", "ParentGEOKey": "263" }, { "Name": "China", "GeoKey": "216", "Level": "5", "ParentGEOKey": "215" }, { "Name": "Colombia", "GeoKey": "268", "Level": "5", "ParentGEOKey": "267" }, { "Name": "Costa Rica", "GeoKey": "289", "Level": "5", "ParentGEOKey": "279" }, { "Name": "Croatia", "GeoKey": "165", "Level": "5", "ParentGEOKey": "118" }, { "Name": "Cyprus", "GeoKey": "170", "Level": "5", "ParentGEOKey": "101" }, { "Name": "Czech Republic", "GeoKey": "99", "Level": "5", "ParentGEOKey": "98" }, { "Name": "Denmark", "GeoKey": "544", "Level": "5", "ParentGEOKey": "543" }, { "Name": "Dominican Republic", "GeoKey": "291", "Level": "5", "ParentGEOKey": "279" }, { "Name": "Ecuador", "GeoKey": "293", "Level": "5", "ParentGEOKey": "279" }, { "Name": "Egypt", "GeoKey": "360", "Level": "5", "ParentGEOKey": "359" }, { "Name": "El Salvador", "GeoKey": "295", "Level": "5", "ParentGEOKey": "279" }, { "Name": "Estonia", "GeoKey": "123", "Level": "5", "ParentGEOKey": "118" }, { "Name": "Finland", "GeoKey": "552", "Level": "5", "ParentGEOKey": "551" }, { "Name": "France", "GeoKey": "205", "Level": "5", "ParentGEOKey": "204" }, { "Name": "Georgia", "GeoKey": "150", "Level": "5", "ParentGEOKey": "118" }, { "Name": "Germany", "GeoKey": "211", "Level": "5", "ParentGEOKey": "210" }, { "Name": "Ghana", "GeoKey": "626", "Level": "5", "ParentGEOKey": "443" }, { "Name": "Greater China Judgment", "GeoKey": "649", "Level": "5", "ParentGEOKey": "648" }, { "Name": "Greece", "GeoKey": "102", "Level": "5", "ParentGEOKey": "101" }, { "Name": "Guatemala", "GeoKey": "297", "Level": "5", "ParentGEOKey": "279" }, { "Name": "Honduras", "GeoKey": "299", "Level": "5", "ParentGEOKey": "279" }, { "Name": "Hong Kong", "GeoKey": "220", "Level": "5", "ParentGEOKey": "219" }, { "Name": "Hungary", "GeoKey": "105", "Level": "5", "ParentGEOKey": "104" }, { "Name": "Iceland", "GeoKey": "548", "Level": "5", "ParentGEOKey": "543" }, { "Name": "India SC", "GeoKey": "235", "Level": "5", "ParentGEOKey": "234" }, { "Name": "Indian Ocean Islands", "GeoKey": "475", "Level": "5", "ParentGEOKey": "443" }, { "Name": "Indonesia", "GeoKey": "37", "Level": "5", "ParentGEOKey": "36" }, { "Name": "Iran", "GeoKey": "646", "Level": "5", "ParentGEOKey": "396" }, { "Name": "Iraq", "GeoKey": "623", "Level": "5", "ParentGEOKey": "396" }, { "Name": "Ireland", "GeoKey": "557", "Level": "5", "ParentGEOKey": "556" }, { "Name": "Israel", "GeoKey": "383", "Level": "5", "ParentGEOKey": "382" }, { "Name": "Italy", "GeoKey": "561", "Level": "5", "ParentGEOKey": "560" }, { "Name": "Japan", "GeoKey": "243", "Level": "5", "ParentGEOKey": "242" }, { "Name": "Jordan", "GeoKey": "394", "Level": "5", "ParentGEOKey": "396" }, { "Name": "Kazakhstan", "GeoKey": "175", "Level": "5", "ParentGEOKey": "132" }, { "Name": "Kenya", "GeoKey": "449", "Level": "5", "ParentGEOKey": "443" }, { "Name": "Korea", "GeoKey": "43", "Level": "5", "ParentGEOKey": "42" }, { "Name": "Kosovo", "GeoKey": "641", "Level": "5", "ParentGEOKey": "118" }, { "Name": "Kuwait", "GeoKey": "367", "Level": "5", "ParentGEOKey": "366" }, { "Name": "Latam Judgment", "GeoKey": "653", "Level": "5", "ParentGEOKey": "652" }, { "Name": "Latin America HQ", "GeoKey": "657", "Level": "5", "ParentGEOKey": "656" }, { "Name": "Latvia", "GeoKey": "125", "Level": "5", "ParentGEOKey": "118" }, { "Name": "Lebanon", "GeoKey": "397", "Level": "5", "ParentGEOKey": "396" }, { "Name": "Libya", "GeoKey": "411", "Level": "5", "ParentGEOKey": "396" }, { "Name": "Lithuania", "GeoKey": "127", "Level": "5", "ParentGEOKey": "118" }, { "Name": "LNM - HQ", "GeoKey": "677", "Level": "5", "ParentGEOKey": "279" }, { "Name": "Luxembourg", "GeoKey": "540", "Level": "5", "ParentGEOKey": "537" }, { "Name": "Macedonia (FYROM)", "GeoKey": "152", "Level": "5", "ParentGEOKey": "118" }, { "Name": "Malaysia", "GeoKey": "50", "Level": "5", "ParentGEOKey": "49" }, { "Name": "Malta", "GeoKey": "172", "Level": "5", "ParentGEOKey": "101" }, { "Name": "MEA Judgment", "GeoKey": "661", "Level": "5", "ParentGEOKey": "660" }, { "Name": "Mexico", "GeoKey": "351", "Level": "5", "ParentGEOKey": "350" }, { "Name": "Moldova", "GeoKey": "159", "Level": "5", "ParentGEOKey": "118" }, { "Name": "Montenegro", "GeoKey": "162", "Level": "5", "ParentGEOKey": "118" }, { "Name": "Morocco", "GeoKey": "415", "Level": "5", "ParentGEOKey": "396" }, { "Name": "Myanmar", "GeoKey": "640", "Level": "5", "ParentGEOKey": "63" }, { "Name": "NEPA New Markets", "GeoKey": "399", "Level": "5", "ParentGEOKey": "396" }, { "Name": "Netherlands", "GeoKey": "567", "Level": "5", "ParentGEOKey": "566" }, { "Name": "New Zealand", "GeoKey": "54", "Level": "5", "ParentGEOKey": "53" }, { "Name": "Nigeria", "GeoKey": "467", "Level": "5", "ParentGEOKey": "466" }, { "Name": "Norway", "GeoKey": "571", "Level": "5", "ParentGEOKey": "570" }, { "Name": "Oman", "GeoKey": "372", "Level": "5", "ParentGEOKey": "369" }, { "Name": "Pakistan", "GeoKey": "420", "Level": "5", "ParentGEOKey": "396" }, { "Name": "Panama", "GeoKey": "304", "Level": "5", "ParentGEOKey": "279" }, { "Name": "Paraguay", "GeoKey": "306", "Level": "5", "ParentGEOKey": "279" }, { "Name": "Peru", "GeoKey": "341", "Level": "5", "ParentGEOKey": "279" }, { "Name": "Philippines", "GeoKey": "60", "Level": "5", "ParentGEOKey": "59" }, { "Name": "Poland", "GeoKey": "108", "Level": "5", "ParentGEOKey": "107" }, { "Name": "Portugal", "GeoKey": "578", "Level": "5", "ParentGEOKey": "577" }, { "Name": "Puerto Rico", "GeoKey": "344", "Level": "5", "ParentGEOKey": "279" }, { "Name": "Qatar", "GeoKey": "375", "Level": "5", "ParentGEOKey": "374" }, { "Name": "Rest of East & Southern Africa", "GeoKey": "451", "Level": "5", "ParentGEOKey": "443" }, { "Name": "Romania", "GeoKey": "111", "Level": "5", "ParentGEOKey": "110" }, { "Name": "Russia", "GeoKey": "189", "Level": "5", "ParentGEOKey": "188" }, { "Name": "Saudi Arabia", "GeoKey": "427", "Level": "5", "ParentGEOKey": "426" }, { "Name": "Serbia", "GeoKey": "178", "Level": "5", "ParentGEOKey": "118" }, { "Name": "Singapore", "GeoKey": "82", "Level": "5", "ParentGEOKey": "81" }, { "Name": "Slovakia", "GeoKey": "114", "Level": "5", "ParentGEOKey": "98" }, { "Name": "Slovenia", "GeoKey": "181", "Level": "5", "ParentGEOKey": "118" }, { "Name": "South Africa", "GeoKey": "431", "Level": "5", "ParentGEOKey": "430" }, { "Name": "South East Asia Multi Country", "GeoKey": "633", "Level": "5", "ParentGEOKey": "63" }, { "Name": "Spain", "GeoKey": "582", "Level": "5", "ParentGEOKey": "581" }, { "Name": "Sri Lanka", "GeoKey": "70", "Level": "5", "ParentGEOKey": "63" }, { "Name": "Sweden", "GeoKey": "588", "Level": "5", "ParentGEOKey": "587" }, { "Name": "Switzerland", "GeoKey": "592", "Level": "5", "ParentGEOKey": "591" }, { "Name": "Taiwan", "GeoKey": "226", "Level": "5", "ParentGEOKey": "225" }, { "Name": "Thailand", "GeoKey": "86", "Level": "5", "ParentGEOKey": "85" }, { "Name": "Trinidad & Tobago", "GeoKey": "308", "Level": "5", "ParentGEOKey": "279" }, { "Name": "Tunisia", "GeoKey": "423", "Level": "5", "ParentGEOKey": "396" }, { "Name": "Turkey", "GeoKey": "437", "Level": "5", "ParentGEOKey": "436" }, { "Name": "Turkmenistan", "GeoKey": "632", "Level": "5", "ParentGEOKey": "132" }, { "Name": "Ukraine", "GeoKey": "119", "Level": "5", "ParentGEOKey": "118" }, { "Name": "Unclassified", "GeoKey": "667", "Level": "5", "ParentGEOKey": "523" }, { "Name": "United Arab Emirates", "GeoKey": "378", "Level": "5", "ParentGEOKey": "377" }, { "Name": "United Kingdom", "GeoKey": "516", "Level": "5", "ParentGEOKey": "515" }, { "Name": "United States", "GeoKey": "526", "Level": "5", "ParentGEOKey": "523" }, { "Name": "Uruguay", "GeoKey": "256", "Level": "5", "ParentGEOKey": "247" }, { "Name": "Venezuela", "GeoKey": "355", "Level": "5", "ParentGEOKey": "279" }, { "Name": "Vietnam", "GeoKey": "74", "Level": "5", "ParentGEOKey": "73" }, { "Name": "West and Central Africa", "GeoKey": "487", "Level": "5", "ParentGEOKey": "443" }, { "Name": "Western Europe Judgment", "GeoKey": "665", "Level": "5", "ParentGEOKey": "664" }, { "Name": "Unknown", "GeoKey": "598", "Level": "5", "ParentGEOKey": "597" }, { "Name": "APAC_Unknown", "GeoKey": "10027", "Level": "5", "ParentGEOKey": "10014" }, { "Name": "Canada_Unknown", "GeoKey": "10028", "Level": "5", "ParentGEOKey": "10015" }, { "Name": "Central and Eastern Europe_Unknown", "GeoKey": "10029", "Level": "5", "ParentGEOKey": "10016" }, { "Name": "France_Unknown", "GeoKey": "10030", "Level": "5", "ParentGEOKey": "10017" }, { "Name": "Germany_Unknown", "GeoKey": "10031", "Level": "5", "ParentGEOKey": "10018" }, { "Name": "Greater China_Unknown", "GeoKey": "10032", "Level": "5", "ParentGEOKey": "10019" }, { "Name": "India_Unknown", "GeoKey": "10033", "Level": "5", "ParentGEOKey": "10020" }, { "Name": "Japan_Unknown", "GeoKey": "10034", "Level": "5", "ParentGEOKey": "10021" }, { "Name": "Latam_Unknown", "GeoKey": "10035", "Level": "5", "ParentGEOKey": "10022" }, { "Name": "MEA_Unknown", "GeoKey": "10036", "Level": "5", "ParentGEOKey": "10023" }, { "Name": "UK_Unknown", "GeoKey": "10037", "Level": "5", "ParentGEOKey": "10024" }, { "Name": "United States_Unknown", "GeoKey": "10038", "Level": "5", "ParentGEOKey": "10025" }, { "Name": "Western Europe_Unknown", "GeoKey": "10039", "Level": "5", "ParentGEOKey": "10026" }, { "Name": "Afghanistan", "GeoKey": "400", "Level": "6", "ParentGEOKey": "399" }, { "Name": "Åland Islands", "GeoKey": "628", "Level": "6", "ParentGEOKey": "552" }, { "Name": "Albania", "GeoKey": "134", "Level": "6", "ParentGEOKey": "133" }, { "Name": "Algeria", "GeoKey": "392", "Level": "6", "ParentGEOKey": "391" }, { "Name": "American Samoa", "GeoKey": "527", "Level": "6", "ParentGEOKey": "526" }, { "Name": "Andorra", "GeoKey": "583", "Level": "6", "ParentGEOKey": "582" }, { "Name": "Angola", "GeoKey": "447", "Level": "6", "ParentGEOKey": "446" }, { "Name": "Anguilla", "GeoKey": "310", "Level": "6", "ParentGEOKey": "308" }, { "Name": "Antarctica", "GeoKey": "249", "Level": "6", "ParentGEOKey": "248" }, { "Name": "Antigua and Barbuda", "GeoKey": "311", "Level": "6", "ParentGEOKey": "308" }, { "Name": "APAC Judgment", "GeoKey": "672", "Level": "6", "ParentGEOKey": "671" }, { "Name": "Argentina", "GeoKey": "250", "Level": "6", "ParentGEOKey": "248" }, { "Name": "Armenia", "GeoKey": "136", "Level": "6", "ParentGEOKey": "135" }, { "Name": "Aruba", "GeoKey": "312", "Level": "6", "ParentGEOKey": "308" }, { "Name": "Asia Pacific HQ", "GeoKey": "676", "Level": "6", "ParentGEOKey": "675" }, { "Name": "Australia", "GeoKey": "10", "Level": "6", "ParentGEOKey": "9" }, { "Name": "Austria", "GeoKey": "535", "Level": "6", "ParentGEOKey": "534" }, { "Name": "Azerbaijan", "GeoKey": "138", "Level": "6", "ParentGEOKey": "137" }, { "Name": "Bahamas", "GeoKey": "281", "Level": "6", "ParentGEOKey": "280" }, { "Name": "Bahrain", "GeoKey": "371", "Level": "6", "ParentGEOKey": "370" }, { "Name": "Bangladesh", "GeoKey": "65", "Level": "6", "ParentGEOKey": "64" }, { "Name": "Barbados", "GeoKey": "313", "Level": "6", "ParentGEOKey": "308" }, { "Name": "Belarus", "GeoKey": "140", "Level": "6", "ParentGEOKey": "139" }, { "Name": "Belgium", "GeoKey": "539", "Level": "6", "ParentGEOKey": "538" }, { "Name": "Belize", "GeoKey": "283", "Level": "6", "ParentGEOKey": "280" }, { "Name": "Benin", "GeoKey": "488", "Level": "6", "ParentGEOKey": "625" }, { "Name": "Bermuda", "GeoKey": "284", "Level": "6", "ParentGEOKey": "280" }, { "Name": "Bhutan", "GeoKey": "237", "Level": "6", "ParentGEOKey": "633" }, { "Name": "Bolivia", "GeoKey": "288", "Level": "6", "ParentGEOKey": "287" }, { "Name": "Bonaire", "GeoKey": "610", "Level": "6", "ParentGEOKey": "308" }, { "Name": "Bosnia and Herzegovina", "GeoKey": "142", "Level": "6", "ParentGEOKey": "141" }, { "Name": "Botswana", "GeoKey": "452", "Level": "6", "ParentGEOKey": "451" }, { "Name": "Bouvet Island", "GeoKey": "572", "Level": "6", "ParentGEOKey": "571" }, { "Name": "Brazil", "GeoKey": "261", "Level": "6", "ParentGEOKey": "260" }, { "Name": "British Indian Ocean Territory", "GeoKey": "238", "Level": "6", "ParentGEOKey": "235" }, { "Name": "British Virgin Islands", "GeoKey": "335", "Level": "6", "ParentGEOKey": "308" }, { "Name": "Brunei", "GeoKey": "68", "Level": "6", "ParentGEOKey": "67" }, { "Name": "Bulgaria", "GeoKey": "131", "Level": "6", "ParentGEOKey": "130" }, { "Name": "Burkina Faso", "GeoKey": "489", "Level": "6", "ParentGEOKey": "487" }, { "Name": "Burundi", "GeoKey": "453", "Level": "6", "ParentGEOKey": "625" }, { "Name": "cabo verde", "GeoKey": "491", "Level": "6", "ParentGEOKey": "487" }, { "Name": "Cambodia", "GeoKey": "75", "Level": "6", "ParentGEOKey": "639" }, { "Name": "Cameroon", "GeoKey": "490", "Level": "6", "ParentGEOKey": "487" }, { "Name": "Canada", "GeoKey": "93", "Level": "6", "ParentGEOKey": "92" }, { "Name": "Cayman Islands", "GeoKey": "285", "Level": "6", "ParentGEOKey": "280" }, { "Name": "Central African Republic", "GeoKey": "492", "Level": "6", "ParentGEOKey": "625" }, { "Name": "Central and Eastern Europe Judgment", "GeoKey": "645", "Level": "6", "ParentGEOKey": "644" }, { "Name": "Chad", "GeoKey": "493", "Level": "6", "ParentGEOKey": "625" }, { "Name": "Chile", "GeoKey": "265", "Level": "6", "ParentGEOKey": "264" }, { "Name": "China", "GeoKey": "217", "Level": "6", "ParentGEOKey": "216" }, { "Name": "Christmas Island", "GeoKey": "11", "Level": "6", "ParentGEOKey": "9" }, { "Name": "Cocos (Keeling) Islands", "GeoKey": "12", "Level": "6", "ParentGEOKey": "9" }, { "Name": "Colombia", "GeoKey": "269", "Level": "6", "ParentGEOKey": "268" }, { "Name": "Comoros", "GeoKey": "477", "Level": "6", "ParentGEOKey": "475" }, { "Name": "Congo", "GeoKey": "494", "Level": "6", "ParentGEOKey": "625" }, { "Name": "Congo (DRC)", "GeoKey": "495", "Level": "6", "ParentGEOKey": "625" }, { "Name": "Congo (DRC) - Do Not Use", "GeoKey": "637", "Level": "6", "ParentGEOKey": "625" }, { "Name": "Cook Islands", "GeoKey": "13", "Level": "6", "ParentGEOKey": "9" }, { "Name": "Costa Rica", "GeoKey": "290", "Level": "6", "ParentGEOKey": "289" }, { "Name": "Côte d'Ivoire", "GeoKey": "498", "Level": "6", "ParentGEOKey": "487" }, { "Name": "Croatia", "GeoKey": "166", "Level": "6", "ParentGEOKey": "165" }, { "Name": "Cuba", "GeoKey": "314", "Level": "6", "ParentGEOKey": "280" }, { "Name": "Curaçao", "GeoKey": "611", "Level": "6", "ParentGEOKey": "308" }, { "Name": "Cyprus", "GeoKey": "171", "Level": "6", "ParentGEOKey": "170" }, { "Name": "Czech Republic", "GeoKey": "100", "Level": "6", "ParentGEOKey": "99" }, { "Name": "Denmark", "GeoKey": "545", "Level": "6", "ParentGEOKey": "544" }, { "Name": "Djibouti", "GeoKey": "478", "Level": "6", "ParentGEOKey": "475" }, { "Name": "Dominica", "GeoKey": "315", "Level": "6", "ParentGEOKey": "308" }, { "Name": "Dominican Republic", "GeoKey": "292", "Level": "6", "ParentGEOKey": "291" }, { "Name": "Ecuador", "GeoKey": "294", "Level": "6", "ParentGEOKey": "293" }, { "Name": "Egypt", "GeoKey": "361", "Level": "6", "ParentGEOKey": "360" }, { "Name": "El Salvador", "GeoKey": "296", "Level": "6", "ParentGEOKey": "295" }, { "Name": "Equatorial Guinea", "GeoKey": "502", "Level": "6", "ParentGEOKey": "625" }, { "Name": "Eritrea", "GeoKey": "454", "Level": "6", "ParentGEOKey": "625" }, { "Name": "Estonia", "GeoKey": "124", "Level": "6", "ParentGEOKey": "123" }, { "Name": "Ethiopia", "GeoKey": "455", "Level": "6", "ParentGEOKey": "451" }, { "Name": "Falkland Islands", "GeoKey": "619", "Level": "6", "ParentGEOKey": "248" }, { "Name": "Faroe Islands", "GeoKey": "546", "Level": "6", "ParentGEOKey": "544" }, { "Name": "Fiji", "GeoKey": "14", "Level": "6", "ParentGEOKey": "9" }, { "Name": "Finland", "GeoKey": "554", "Level": "6", "ParentGEOKey": "552" }, { "Name": "France", "GeoKey": "206", "Level": "6", "ParentGEOKey": "205" }, { "Name": "French Guiana", "GeoKey": "316", "Level": "6", "ParentGEOKey": "308" }, { "Name": "French Polynesia", "GeoKey": "479", "Level": "6", "ParentGEOKey": "475" }, { "Name": "French Southern Territories", "GeoKey": "16", "Level": "6", "ParentGEOKey": "9" }, { "Name": "Gabon", "GeoKey": "503", "Level": "6", "ParentGEOKey": "487" }, { "Name": "Gambia", "GeoKey": "468", "Level": "6", "ParentGEOKey": "625" }, { "Name": "Gaza Strip", "GeoKey": "401", "Level": "6", "ParentGEOKey": "394" }, { "Name": "Georgia", "GeoKey": "151", "Level": "6", "ParentGEOKey": "150" }, { "Name": "Germany", "GeoKey": "212", "Level": "6", "ParentGEOKey": "211" }, { "Name": "Ghana", "GeoKey": "470", "Level": "6", "ParentGEOKey": "626" }, { "Name": "Gibraltar", "GeoKey": "584", "Level": "6", "ParentGEOKey": "582" }, { "Name": "Greater China Judgment", "GeoKey": "650", "Level": "6", "ParentGEOKey": "649" }, { "Name": "Greece", "GeoKey": "103", "Level": "6", "ParentGEOKey": "102" }, { "Name": "Greenland", "GeoKey": "547", "Level": "6", "ParentGEOKey": "544" }, { "Name": "Grenada", "GeoKey": "317", "Level": "6", "ParentGEOKey": "308" }, { "Name": "Guadeloupe", "GeoKey": "318", "Level": "6", "ParentGEOKey": "308" }, { "Name": "Guam", "GeoKey": "528", "Level": "6", "ParentGEOKey": "526" }, { "Name": "Guatemala", "GeoKey": "298", "Level": "6", "ParentGEOKey": "297" }, { "Name": "Guernsey", "GeoKey": "517", "Level": "6", "ParentGEOKey": "516" }, { "Name": "Guinea", "GeoKey": "504", "Level": "6", "ParentGEOKey": "625" }, { "Name": "Guinea-Bissau", "GeoKey": "505", "Level": "6", "ParentGEOKey": "625" }, { "Name": "Guyana", "GeoKey": "319", "Level": "6", "ParentGEOKey": "308" }, { "Name": "Haiti", "GeoKey": "320", "Level": "6", "ParentGEOKey": "308" }, { "Name": "Heard Island and McDonald Islands", "GeoKey": "18", "Level": "6", "ParentGEOKey": "9" }, { "Name": "Honduras", "GeoKey": "300", "Level": "6", "ParentGEOKey": "299" }, { "Name": "Hong Kong SAR", "GeoKey": "221", "Level": "6", "ParentGEOKey": "220" }, { "Name": "Hungary", "GeoKey": "106", "Level": "6", "ParentGEOKey": "105" }, { "Name": "Iceland", "GeoKey": "549", "Level": "6", "ParentGEOKey": "548" }, { "Name": "India", "GeoKey": "239", "Level": "6", "ParentGEOKey": "235" }, { "Name": "Indonesia", "GeoKey": "40", "Level": "6", "ParentGEOKey": "37" }, { "Name": "Iran", "GeoKey": "402", "Level": "6", "ParentGEOKey": "646" }, { "Name": "Iraq", "GeoKey": "404", "Level": "6", "ParentGEOKey": "623" }, { "Name": "Ireland", "GeoKey": "558", "Level": "6", "ParentGEOKey": "557" }, { "Name": "Isle of Man", "GeoKey": "518", "Level": "6", "ParentGEOKey": "516" }, { "Name": "Israel", "GeoKey": "384", "Level": "6", "ParentGEOKey": "383" }, { "Name": "Italy", "GeoKey": "562", "Level": "6", "ParentGEOKey": "561" }, { "Name": "Jamaica", "GeoKey": "303", "Level": "6", "ParentGEOKey": "280" }, { "Name": "Jan Mayen", "GeoKey": "575", "Level": "6", "ParentGEOKey": "571" }, { "Name": "Japan", "GeoKey": "244", "Level": "6", "ParentGEOKey": "243" }, { "Name": "Jersey", "GeoKey": "519", "Level": "6", "ParentGEOKey": "516" }, { "Name": "Jordan", "GeoKey": "395", "Level": "6", "ParentGEOKey": "394" }, { "Name": "Kazakhstan", "GeoKey": "176", "Level": "6", "ParentGEOKey": "175" }, { "Name": "Kenya", "GeoKey": "450", "Level": "6", "ParentGEOKey": "449" }, { "Name": "Kiribati", "GeoKey": "19", "Level": "6", "ParentGEOKey": "9" }, { "Name": "Korea", "GeoKey": "44", "Level": "6", "ParentGEOKey": "43" }, { "Name": "Kosovo", "GeoKey": "634", "Level": "6", "ParentGEOKey": "641" }, { "Name": "Kuwait", "GeoKey": "368", "Level": "6", "ParentGEOKey": "367" }, { "Name": "Kyrgyzstan", "GeoKey": "145", "Level": "6", "ParentGEOKey": "144" }, { "Name": "L. America Other", "GeoKey": "321", "Level": "6", "ParentGEOKey": "308" }, { "Name": "Laos", "GeoKey": "76", "Level": "6", "ParentGEOKey": "633" }, { "Name": "LATAM HQ", "GeoKey": "658", "Level": "6", "ParentGEOKey": "657" }, { "Name": "Latam Judgment", "GeoKey": "654", "Level": "6", "ParentGEOKey": "653" }, { "Name": "Latam NM HQ", "GeoKey": "678", "Level": "6", "ParentGEOKey": "677" }, { "Name": "Latvia", "GeoKey": "126", "Level": "6", "ParentGEOKey": "125" }, { "Name": "Lebanon", "GeoKey": "398", "Level": "6", "ParentGEOKey": "397" }, { "Name": "Lesotho", "GeoKey": "432", "Level": "6", "ParentGEOKey": "431" }, { "Name": "Liberia", "GeoKey": "471", "Level": "6", "ParentGEOKey": "625" }, { "Name": "Libya", "GeoKey": "412", "Level": "6", "ParentGEOKey": "411" }, { "Name": "Liechtenstein", "GeoKey": "593", "Level": "6", "ParentGEOKey": "592" }, { "Name": "Lithuania", "GeoKey": "128", "Level": "6", "ParentGEOKey": "127" }, { "Name": "Luxembourg", "GeoKey": "541", "Level": "6", "ParentGEOKey": "540" }, { "Name": "Macao SAR", "GeoKey": "223", "Level": "6", "ParentGEOKey": "220" }, { "Name": "Macedonia, FYRO", "GeoKey": "156", "Level": "6", "ParentGEOKey": "152" }, { "Name": "Madagascar", "GeoKey": "480", "Level": "6", "ParentGEOKey": "475" }, { "Name": "Malawi", "GeoKey": "456", "Level": "6", "ParentGEOKey": "625" }, { "Name": "Malaysia", "GeoKey": "51", "Level": "6", "ParentGEOKey": "50" }, { "Name": "Maldives", "GeoKey": "71", "Level": "6", "ParentGEOKey": "70" }, { "Name": "Mali", "GeoKey": "506", "Level": "6", "ParentGEOKey": "487" }, { "Name": "Malta", "GeoKey": "173", "Level": "6", "ParentGEOKey": "172" }, { "Name": "Marshall Islands", "GeoKey": "20", "Level": "6", "ParentGEOKey": "9" }, { "Name": "Martinique", "GeoKey": "322", "Level": "6", "ParentGEOKey": "308" }, { "Name": "Mauritania", "GeoKey": "416", "Level": "6", "ParentGEOKey": "415" }, { "Name": "Mauritius", "GeoKey": "481", "Level": "6", "ParentGEOKey": "475" }, { "Name": "Mayotte", "GeoKey": "482", "Level": "6", "ParentGEOKey": "475" }, { "Name": "MEA Judgment", "GeoKey": "662", "Level": "6", "ParentGEOKey": "661" }, { "Name": "Mexico", "GeoKey": "352", "Level": "6", "ParentGEOKey": "351" }, { "Name": "Micronesia", "GeoKey": "21", "Level": "6", "ParentGEOKey": "9" }, { "Name": "Moldova", "GeoKey": "160", "Level": "6", "ParentGEOKey": "159" }, { "Name": "Monaco", "GeoKey": "207", "Level": "6", "ParentGEOKey": "205" }, { "Name": "Mongolia", "GeoKey": "146", "Level": "6", "ParentGEOKey": "144" }, { "Name": "Montenegro", "GeoKey": "163", "Level": "6", "ParentGEOKey": "162" }, { "Name": "Montserrat", "GeoKey": "323", "Level": "6", "ParentGEOKey": "308" }, { "Name": "Morocco", "GeoKey": "417", "Level": "6", "ParentGEOKey": "415" }, { "Name": "Mozambique", "GeoKey": "448", "Level": "6", "ParentGEOKey": "446" }, { "Name": "Myanmar", "GeoKey": "635", "Level": "6", "ParentGEOKey": "640" }, { "Name": "Namibia", "GeoKey": "457", "Level": "6", "ParentGEOKey": "451" }, { "Name": "Nauru", "GeoKey": "23", "Level": "6", "ParentGEOKey": "9" }, { "Name": "Nepal", "GeoKey": "636", "Level": "6", "ParentGEOKey": "633" }, { "Name": "Netherlands", "GeoKey": "568", "Level": "6", "ParentGEOKey": "567" }, { "Name": "Netherlands Antilles", "GeoKey": "324", "Level": "6", "ParentGEOKey": "308" }, { "Name": "New Caledonia", "GeoKey": "483", "Level": "6", "ParentGEOKey": "475" }, { "Name": "New Zealand", "GeoKey": "55", "Level": "6", "ParentGEOKey": "54" }, { "Name": "Nicaragua", "GeoKey": "301", "Level": "6", "ParentGEOKey": "299" }, { "Name": "Niger", "GeoKey": "507", "Level": "6", "ParentGEOKey": "625" }, { "Name": "Nigeria", "GeoKey": "472", "Level": "6", "ParentGEOKey": "467" }, { "Name": "Niue", "GeoKey": "24", "Level": "6", "ParentGEOKey": "9" }, { "Name": "Norfolk Island", "GeoKey": "25", "Level": "6", "ParentGEOKey": "9" }, { "Name": "North Korea", "GeoKey": "47", "Level": "6", "ParentGEOKey": "43" }, { "Name": "Northern Mariana Islands", "GeoKey": "26", "Level": "6", "ParentGEOKey": "9" }, { "Name": "Norway", "GeoKey": "573", "Level": "6", "ParentGEOKey": "571" }, { "Name": "Oman", "GeoKey": "373", "Level": "6", "ParentGEOKey": "372" }, { "Name": "Pakistan", "GeoKey": "421", "Level": "6", "ParentGEOKey": "420" }, { "Name": "Palau", "GeoKey": "27", "Level": "6", "ParentGEOKey": "9" }, { "Name": "Palestinian Authority", "GeoKey": "405", "Level": "6", "ParentGEOKey": "394" }, { "Name": "Panama", "GeoKey": "305", "Level": "6", "ParentGEOKey": "304" }, { "Name": "Papua New Guinea", "GeoKey": "28", "Level": "6", "ParentGEOKey": "9" }, { "Name": "Paraguay", "GeoKey": "307", "Level": "6", "ParentGEOKey": "306" }, { "Name": "Peru", "GeoKey": "342", "Level": "6", "ParentGEOKey": "341" }, { "Name": "Philippines", "GeoKey": "61", "Level": "6", "ParentGEOKey": "60" }, { "Name": "Pitcairn Islands", "GeoKey": "29", "Level": "6", "ParentGEOKey": "9" }, { "Name": "Poland", "GeoKey": "109", "Level": "6", "ParentGEOKey": "108" }, { "Name": "Portugal", "GeoKey": "579", "Level": "6", "ParentGEOKey": "578" }, { "Name": "Puerto Rico", "GeoKey": "345", "Level": "6", "ParentGEOKey": "344" }, { "Name": "Qatar", "GeoKey": "376", "Level": "6", "ParentGEOKey": "375" }, { "Name": "Réunion", "GeoKey": "484", "Level": "6", "ParentGEOKey": "475" }, { "Name": "Romania", "GeoKey": "112", "Level": "6", "ParentGEOKey": "111" }, { "Name": "Russia", "GeoKey": "190", "Level": "6", "ParentGEOKey": "189" }, { "Name": "Rwanda", "GeoKey": "458", "Level": "6", "ParentGEOKey": "451" }, { "Name": "Saba", "GeoKey": "612", "Level": "6", "ParentGEOKey": "308" }, { "Name": "Saint Barthélemy", "GeoKey": "326", "Level": "6", "ParentGEOKey": "308" }, { "Name": "Saint Kitts and Nevis", "GeoKey": "621", "Level": "6", "ParentGEOKey": "308" }, { "Name": "Saint Lucia", "GeoKey": "327", "Level": "6", "ParentGEOKey": "308" }, { "Name": "Saint Martin", "GeoKey": "615", "Level": "6", "ParentGEOKey": "308" }, { "Name": "Saint Pierre and Miquelon", "GeoKey": "94", "Level": "6", "ParentGEOKey": "92" }, { "Name": "Saint Vincent and the Grenadines", "GeoKey": "330", "Level": "6", "ParentGEOKey": "308" }, { "Name": "Samoa", "GeoKey": "56", "Level": "6", "ParentGEOKey": "54" }, { "Name": "San Marino", "GeoKey": "563", "Level": "6", "ParentGEOKey": "561" }, { "Name": "São Tomé and Príncipe", "GeoKey": "508", "Level": "6", "ParentGEOKey": "625" }, { "Name": "Saudi Arabia", "GeoKey": "428", "Level": "6", "ParentGEOKey": "427" }, { "Name": "Senegal", "GeoKey": "509", "Level": "6", "ParentGEOKey": "487" }, { "Name": "Serbia", "GeoKey": "179", "Level": "6", "ParentGEOKey": "178" }, { "Name": "Seychelles", "GeoKey": "485", "Level": "6", "ParentGEOKey": "475" }, { "Name": "Sierra Leone", "GeoKey": "473", "Level": "6", "ParentGEOKey": "625" }, { "Name": "Singapore", "GeoKey": "83", "Level": "6", "ParentGEOKey": "82" }, { "Name": "Sint Eustatius", "GeoKey": "616", "Level": "6", "ParentGEOKey": "308" }, { "Name": "Sint Maarten", "GeoKey": "614", "Level": "6", "ParentGEOKey": "308" }, { "Name": "Slovakia", "GeoKey": "115", "Level": "6", "ParentGEOKey": "114" }, { "Name": "Slovenia", "GeoKey": "182", "Level": "6", "ParentGEOKey": "181" }, { "Name": "Solomon Islands", "GeoKey": "30", "Level": "6", "ParentGEOKey": "9" }, { "Name": "Somalia", "GeoKey": "459", "Level": "6", "ParentGEOKey": "625" }, { "Name": "South Africa", "GeoKey": "433", "Level": "6", "ParentGEOKey": "431" }, { "Name": "South Georgia and South Sandwich Islands", "GeoKey": "620", "Level": "6", "ParentGEOKey": "248" }, { "Name": "South Sudan", "GeoKey": "624", "Level": "6", "ParentGEOKey": "625" }, { "Name": "Spain", "GeoKey": "585", "Level": "6", "ParentGEOKey": "582" }, { "Name": "Sri Lanka", "GeoKey": "72", "Level": "6", "ParentGEOKey": "70" }, { "Name": "St Helena, Ascension, Tristan da Cunha", "GeoKey": "629", "Level": "6", "ParentGEOKey": "625" }, { "Name": "Sudan", "GeoKey": "460", "Level": "6", "ParentGEOKey": "625" }, { "Name": "Suriname", "GeoKey": "332", "Level": "6", "ParentGEOKey": "308" }, { "Name": "Svalbard", "GeoKey": "574", "Level": "6", "ParentGEOKey": "571" }, { "Name": "Swaziland", "GeoKey": "434", "Level": "6", "ParentGEOKey": "431" }, { "Name": "Sweden", "GeoKey": "589", "Level": "6", "ParentGEOKey": "588" }, { "Name": "Switzerland", "GeoKey": "594", "Level": "6", "ParentGEOKey": "592" }, { "Name": "Syria", "GeoKey": "407", "Level": "6", "ParentGEOKey": "399" }, { "Name": "Taiwan", "GeoKey": "227", "Level": "6", "ParentGEOKey": "226" }, { "Name": "Tajikistan", "GeoKey": "147", "Level": "6", "ParentGEOKey": "144" }, { "Name": "Tanzania", "GeoKey": "461", "Level": "6", "ParentGEOKey": "451" }, { "Name": "Thailand", "GeoKey": "88", "Level": "6", "ParentGEOKey": "86" }, { "Name": "Timor-Leste", "GeoKey": "38", "Level": "6", "ParentGEOKey": "37" }, { "Name": "Togo", "GeoKey": "512", "Level": "6", "ParentGEOKey": "625" }, { "Name": "Tokelau", "GeoKey": "31", "Level": "6", "ParentGEOKey": "9" }, { "Name": "Tonga", "GeoKey": "32", "Level": "6", "ParentGEOKey": "9" }, { "Name": "Trinidad and Tobago", "GeoKey": "333", "Level": "6", "ParentGEOKey": "308" }, { "Name": "Tunisia", "GeoKey": "424", "Level": "6", "ParentGEOKey": "423" }, { "Name": "Turkey", "GeoKey": "438", "Level": "6", "ParentGEOKey": "437" }, { "Name": "Turkmenistan", "GeoKey": "148", "Level": "6", "ParentGEOKey": "632" }, { "Name": "Turks and Caicos Islands", "GeoKey": "286", "Level": "6", "ParentGEOKey": "280" }, { "Name": "Tuvalu", "GeoKey": "33", "Level": "6", "ParentGEOKey": "9" }, { "Name": "U.S. Outlying Islands", "GeoKey": "529", "Level": "6", "ParentGEOKey": "526" }, { "Name": "U.S. Virgin Islands", "GeoKey": "622", "Level": "6", "ParentGEOKey": "344" }, { "Name": "Uganda", "GeoKey": "463", "Level": "6", "ParentGEOKey": "451" }, { "Name": "Ukraine", "GeoKey": "120", "Level": "6", "ParentGEOKey": "119" }, { "Name": "Unclassified Country", "GeoKey": "668", "Level": "6", "ParentGEOKey": "667" }, { "Name": "United Arab Emirates", "GeoKey": "379", "Level": "6", "ParentGEOKey": "378" }, { "Name": "United Kingdom", "GeoKey": "520", "Level": "6", "ParentGEOKey": "516" }, { "Name": "United States", "GeoKey": "530", "Level": "6", "ParentGEOKey": "526" }, { "Name": "Uruguay", "GeoKey": "257", "Level": "6", "ParentGEOKey": "256" }, { "Name": "Uzbekistan", "GeoKey": "149", "Level": "6", "ParentGEOKey": "144" }, { "Name": "Vanuatu", "GeoKey": "57", "Level": "6", "ParentGEOKey": "54" }, { "Name": "Vatican City", "GeoKey": "564", "Level": "6", "ParentGEOKey": "561" }, { "Name": "Venezuela", "GeoKey": "356", "Level": "6", "ParentGEOKey": "355" }, { "Name": "Vietnam", "GeoKey": "78", "Level": "6", "ParentGEOKey": "74" }, { "Name": "Wallis and Futuna", "GeoKey": "34", "Level": "6", "ParentGEOKey": "9" }, { "Name": "West Bank", "GeoKey": "409", "Level": "6", "ParentGEOKey": "394" }, { "Name": "Western Europe Judgment", "GeoKey": "666", "Level": "6", "ParentGEOKey": "665" }, { "Name": "Western Sahara", "GeoKey": "418", "Level": "6", "ParentGEOKey": "415" }, { "Name": "Yemen", "GeoKey": "380", "Level": "6", "ParentGEOKey": "378" }, { "Name": "Zambia", "GeoKey": "464", "Level": "6", "ParentGEOKey": "451" }, { "Name": "Zimbabwe", "GeoKey": "465", "Level": "6", "ParentGEOKey": "451" }, { "Name": "APAC_Unknown", "GeoKey": "10040", "Level": "6", "ParentGEOKey": "10027" }, { "Name": "Canada_Unknown", "GeoKey": "10041", "Level": "6", "ParentGEOKey": "10028" }, { "Name": "Central and Eastern Europe_Unknown", "GeoKey": "10042", "Level": "6", "ParentGEOKey": "10029" }, { "Name": "France_Unknown", "GeoKey": "10043", "Level": "6", "ParentGEOKey": "10030" }, { "Name": "Germany_Unknown", "GeoKey": "10044", "Level": "6", "ParentGEOKey": "10031" }, { "Name": "Greater China_Unknown", "GeoKey": "10045", "Level": "6", "ParentGEOKey": "10032" }, { "Name": "India_Unknown", "GeoKey": "10046", "Level": "6", "ParentGEOKey": "10033" }, { "Name": "Japan_Unknown", "GeoKey": "10047", "Level": "6", "ParentGEOKey": "10034" }, { "Name": "Latam_Unknown", "GeoKey": "10048", "Level": "6", "ParentGEOKey": "10035" }, { "Name": "MEA_Unknown", "GeoKey": "10049", "Level": "6", "ParentGEOKey": "10036" }, { "Name": "UK_Unknown", "GeoKey": "10050", "Level": "6", "ParentGEOKey": "10037" }, { "Name": "United States_Unknown", "GeoKey": "10051", "Level": "6", "ParentGEOKey": "10038" }, { "Name": "Western Europe_Unknown", "GeoKey": "10052", "Level": "6", "ParentGEOKey": "10039" }, { "Name": "UNKNOWN", "GeoKey": "607", "Level": "6", "ParentGEOKey": "598" }];

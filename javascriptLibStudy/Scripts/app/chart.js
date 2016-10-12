(function () {  //2337434
    window.chart = function (age) {
        return new CreatChart(age);
    }
    function CreatChart(age) {
        this.createLineChart = new function () {
            this.create = function () {
                console.log("create");
            }
        };
        //init;
        this.init = function () {
            $("#draw").bind("click", function () { alert(123) });
        }();
    }
    chart.sayHello = function () {
        alert("hello");
    }
})();
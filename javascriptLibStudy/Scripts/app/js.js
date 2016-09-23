$(document).ready(function () {
    $("div").click(function () {
        alert(123);
    })
    $("#btn1").bind("click", function () {
        alert(456);
    })
})
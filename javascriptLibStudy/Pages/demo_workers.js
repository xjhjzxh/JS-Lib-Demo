var i = 0;

function timedCount() {
    var sum = 0;
    for (var i = 0; i < 100000000; i++) {
        sum += i;
    }
    return sum;
}
self.addEventListener('message', function (event) {
    self.postMessage(timedCount(event.data))
}, false);
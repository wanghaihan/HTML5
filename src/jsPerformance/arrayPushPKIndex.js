var MAX_LENGTH = 1000000000;
// loop 10 times to minimize this variation
var LOOP_COUNT = 10;

function testA(num) {
    console.time('a');
    for (var k = 0; k < LOOP_COUNT; k++) {
        var a = [];
        for (var i = 0; i < num; i++) {
            a[i] = i;
        }
    }
    console.timeEnd('a');
}

function testB(num) {
    console.time('b');
    for (var k = 0; k < LOOP_COUNT; k++) {
        var b = [];
        for (var i = 0; i < num; i++) {
            b.push(i);
        }
    }
    console.timeEnd('b');
}

(function () {
    for (var j = 1; j < MAX_LENGTH; j *= 10) {
        console.log(j);
        testA(j);
        testB(j);
    }
})();
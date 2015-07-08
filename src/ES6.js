/**
 * Created by wanghaihan on 3/7/15.
 */
console.log ('let');
(function testLet() {
    // issue of var
    var param = 'good result';
    if (true) {
        var param = 'bad result';
    }
    console.log(param);

    // old way to fix var issue
    var param2 = 'good result';
    (function () {
        if (true) {
            var param2 = 'bad result';
        }
    })();
    console.log(param2);

    // let
    "strict"
    let param3 = 'good result';
    if (true) {
        let param3 = 'bad result';
    }
    console.log(param3);
})();


console.log ();
console.log ('const');
(function(){
    const a = 'old value';
    a = 'new value';
    console.log (a);
})();


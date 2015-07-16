/**
 * @file test indexed db
 *
 * @author Haihan Wang(wanghaihan@baidu.com)
 */
/* global console,Promise*/
var DB_NAME = 'library32';
var STORE_NAME = 'matrix10kAnd5';
var DATA_COUNT = 100000;
var FIELD_COUNT = 10;
var msgDom;
var logDom;

function openDBAsync() {
    var promise = new Promise(function (resolve, reject) {
        var request = indexedDB.open(DB_NAME, 5);
        request.onupgradeneeded = function (event) {
            var db = event.target.result;
            log('update from ' + event.oldVersion + ' to ' + event.newVersion);
            if (event.oldVersion < 1) {
                var store = db.createObjectStore(STORE_NAME, {
                    keyPath: 'id',
                    autoIncrement: false
                });
                for (var i = 0; i < FIELD_COUNT; i++) {
                    store.createIndex('i_field' + i, 'field' + i, {
                        unique: false
                    });
                }
            }

        };

        request.onsuccess = function (e) {
            var db = e.target.result;
            log('open db version: ' + db.version);
            resolve(db);
        };
        request.onerror = function (e) {
            log('db error: ' + e.target.error.message);
            reject(e);
        };
    });
    return promise;
}

function generateData() {
    var con = openDBAsync();
    con.then(function (db) {
        var transaction = db.transaction(STORE_NAME, 'readwrite');
        var store = transaction.objectStore(STORE_NAME);
        var randomData = [];
        for (var i = 0; i < DATA_COUNT; i++) {
            var data = {
                id: i
            };
            for (var j = 0; j < FIELD_COUNT; j++) {
                data['field' + j] = Math.round(Math.random() * DATA_COUNT);
            }
            randomData.push(data);
        }
        var index = 0;
        var batchCount = DATA_COUNT;
        var addClocker = new Clocker('Add' + batchCount);
        // var putClocker = new Clocker('Put' + batchCount);

        transaction.oncomplete = function (evt) {
            addClocker.record('Add real finished');
        };
        // alternate to avoid first time influence
        addClocker.start();
        for (i = 0; i < batchCount; i++) {
            store.add(randomData[index++]);
        }
        addClocker.record();
        // putClocker.start();
        // for (i = 0; i < batchCount; i++) {
        //     store.put(randomData[index++]);
        // }
        // putClocker.record();
    });
}


function mod(isPutWhenGet) {
    var con = openDBAsync();
    con.then(function (db) {
        var transaction = db.transaction(STORE_NAME, 'readwrite');
        var store = transaction.objectStore(STORE_NAME);
        var keyRange = IDBKeyRange.upperBound(DATA_COUNT / 2, false);

        var clocker = new Clocker('modify data');
        clocker.start();
        var req = store.index('i_field6').openCursor(keyRange, 'next');

        // update data on the cursor
        var count = 0;
        var putWhenGet = function (event) {
            var cursor = event.target.result;
            if (!cursor) {
                db.close();
                clocker.record('modify count: ' + count);
                return;
            }
            count++;
            var value = cursor.value;
            value.field3 += 1;
            cursor.update(value);
            //store.put(value);
            cursor.continue();
        };

        // get the data from cursor and put the at the end
        var toModify = [];
        var put = function () {
            var modify = function (item) {
                item.field3 += 1;
                store.put(item);
            };
            toModify.forEach(modify);
            db.close();
            clocker.record('put count: ' + toModify.length);
        };
        var get = function (event) {
            var cursor = event.target.result;
            if (!cursor) {
                clocker.record('get count: ' + toModify.length);
                // put all the data after get them all
                put();
                return;
            }
            toModify.push(cursor.value);
            cursor.continue();
        };
        req.onsuccess = isPutWhenGet ? putWhenGet : get;
        transaction.oncomplete = function (evt) {
            clocker.record('real finished');
        };
    });
}

function Clocker(name) {
    this.title = '(' + name + ') ';
    this.start = function () {
        log(this.title + 'started');
        this.startTime = new Date().getTime();
    };
    this.record = function (msg) {
        var stopTime = new Date().getTime();
        msg = msg ? this.title + msg : this.title;
        log(msg + ' cost ' + (stopTime - this.startTime) + ' ms');
        this.startTime = new Date().getTime();
    };
}

var globalLogText = '';

function log(msg) {
    globalLogText = msg + '\n' + globalLogText;
    console.log(msg);
    logDom.value = globalLogText;
}

function load() {
    msgDom = document.getElementById('msg');
    logDom = document.getElementById('log');
}

(function () {
    if (document.all) {
        window.attachEvent('onload', load);
    } else {
        window.addEventListener('load', load, false);
    }
})();


/**
 * 例： 输入 '"abc",de,ae,"111,222"' 返回 ['abc', 'de', 'ae', '111,222']
 */
function getRealArr(str) {
    if (str.indexOf('\t') > -1) {
        return str.split('\t');
    }
    var tmp = str.split(',');
    var arr = [];
    var inbox = false;
    var tmpstr = '';
    var inner = '';
    for (var n = 0; n < tmp.length; n++) {
        inner = tmp[n];
        if (inbox) {
            if (inner.charAt(inner.length - 1) === '"') {
                tmpstr = tmpstr + ',' + inner.substr(0, inner.length - 1);
                inbox = false;
                arr.push(tmpstr);
                tmpstr = '';
            } else {
                tmpstr = tmpstr + inner;
            }
        } else {
            if (inner.charAt(0) === '"') {
                if (inner.charAt(inner.length - 1) === '"') {
                    arr.push(inner.substr(1, inner.length - 2));
                } else {
                    tmpstr = inner.substr(1, inner.length - 1);
                    inbox = true;
                }
            } else {
                arr.push(inner);
            }
        }
    }
    return arr;
}


// 将关键字、创意的planid和unitid转译
exports.fixedKeywordAndIdea = function (arr, plan, unit, level, noGroup) {
    var unGroupCount = 0;
    var newPlan = {};
    var newUnit = {};
    for (var n = 0; n < arr.length; n++) {
        var item = arr[n];
        var unitkey = item.planid + item.unitid;
        if ($.trim(item.planid) === '' || $.trim(item.unitid) === '') {
            // 未分组
            unGroupCount++;
            item.planid = 0;
            item.unitid = 0;
        } else if (unit[unitkey] === undefined) {
            // 需要新建单元，不可能存在计划没有，单元有的情况
            noGroup[level].push(arr.splice(n, 1)[0]);
            n = n - 1;
            if (!newUnit[item.planid + item.unitid]) {
                noGroup.unit.push(createOneDefaultUnit(item.unitid, item.planid, item.bid));
                newUnit[item.planid + item.unitid] = 1;
            }
            if (!plan[item.planid] && !newPlan[item.planid]) {
                noGroup.plan.push(createOneDefaultPlan(item.planid));
                newPlan[item.planid] = 1;
            }
        } else {
            item.planid = plan[item.planid] ? plan[item.planid] : 0;
            item.unitid = unit[unitkey] ? unit[unitkey] : 0;
            // 处理仅移动计划特殊情况
            if (item.planid && onlyMobilePlanIds[item.planid]) {
                // ...
            }
        }
    }
    unGroupCount && addUnGroupInfo(unGroupCount, level);
    return arr;
};
/**
 * @file test indexed db
 *
 * @author Haihan Wang(wanghaihan@baidu.com)
 */
/* global console,Promise*/
var DB_NAME = 'library19';
var STORE_NAME = 'matrix10kAnd5';
var DATA_COUNT = 100000;
var FIELD_COUNT = 10;

function openDBAsync() {
    var promise = new Promise(function (resolve, reject) {
        var request = indexedDB.open(DB_NAME, 1);
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
        var batchCount = DATA_COUNT / 2;
        var addClocker = new Clocker('Add' + batchCount);
        var putClocker = new Clocker('Put' + batchCount);

        // alternate to avoid first time influence
        addClocker.start();
        for (i = 0; i < batchCount; i++) {
            store.add(randomData[index++]);
        }
        addClocker.record();
        putClocker.start();
        for (i = 0; i < batchCount; i++) {
            store.put(randomData[index++]);
        }
        putClocker.record();
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

function log (msg) {
    console.log(msg);
}

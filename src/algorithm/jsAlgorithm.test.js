/**
 * @ignore
 * @file 一些js算法
 * @author Haihan Wang (wanghaihan@baidu.com)
 */
define(function (require) {
    describe('bad binarySearch', function () {
        function binarySearch(data, dest) {
            var h = data.length - 1;
            var l = 0;
            while (l <= h) {
                var m = Math.floor((h + l) / 2);
                if (data[m] == dest) {
                    return m;
                }
                if (dest > data[m]) {
                    l = m + 1;
                } else {
                    h = m - 1;
                }
            }
            return false;
        }

        it('验证一般数据', function () {
            var arr = [-34, 1, 3, 4, 5, 8, 34, 45, 65, 87];
            expect(binarySearch(arr, 4)).toBeTruthy();
            expect(binarySearch(arr, 6)).toBeFalsy();
        });
    });


    describe('good binarySearch', function () {
        function binarySearch(data, dest) {
            if (data == null || data.length === 0) {
                return false;
            }
            var h = data.length - 1;
            var l = 0;
            while (l <= h) {
                var m = Math.floor((h + l) / 2);
                if (data[m] == dest) {
                    return m;
                }
                if (dest > data[m]) {
                    l = m + 1;
                } else {
                    h = m - 1;
                }
            }
            return false;
        }

        it('验证一般数据', function () {
            var arr = [-34, 1, 3, 4, 5, 8, 34, 45, 65, 87];
            expect(binarySearch(arr, 4)).toBeTruthy();
            expect(binarySearch(arr, 6)).toBeFalsy();
            expect(binarySearch(arr, -44)).toBeFalsy();
            expect(binarySearch(arr, 90)).toBeFalsy();
        });
        it('验证空值', function () {
            expect(binarySearch(null, 4)).toBeFalsy();
            expect(binarySearch([], 6)).toBeFalsy();
        });
        it('验证特殊数据', function () {
            expect(binarySearch([4, 4, 4, 4], 4)).toBeTruthy();
            expect(binarySearch([0], 4)).toBeFalsy();
        });
    });
});

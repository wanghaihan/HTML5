/**
 * @file trie tree for words index
 * @author Haihan Wang(wanghaihan@baidu.com)
 */

define(function (require, exports) {
    function TrieTree() {
        /**
         * root
         * @protected
         * @type {Object}
         */
        this.root = this.newNode();
    }

    TrieTree.prototype = {
        // inline function. better be merged into code in release.
        newNode: function () {
            return {
                /**
                 * child nodes
                 * @type {Object}
                 */
                n: {},
                /**
                 * id array
                 * @type {Array}
                 */
                i: []
            };
        },
        add: function (chars, id) {
            var parent = this.root;
            var length = chars ? chars.length : 0;
            var node;
            for (var i = 0; i < length; i++) {
                var char = chars[i];
                node = parent.n[char];
                if (node) {
                    parent = node;
                } else {
                    node = this.newNode(char);
                    parent.n[char] = node;
                    parent = node;
                    // a quick adding for improving performace
                    while (++i < length) {
                        char = chars[i];
                        node = this.newNode(char);
                        parent.n[char] = node;
                        parent = node;
                    }
                    break;
                }
            }
            parent.i.push(id);
        },
        get: function (chars) {
            var parent = this.root;
            var length = chars ? chars.length : 0;
            var node;
            for (var i = 0; i < length; i++) {
                node = parent.n[chars[i]];
                if (node) {
                    parent = node;
                } else {
                    return [];
                }
            }
            return parent.i;
        }
    };
    return TrieTree;
});
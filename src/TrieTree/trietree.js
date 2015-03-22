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
        /**
         * node struct
         * inline function. better be merged into code in release.
         * @return {Object} new empty node
         * @protected
         */
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
        /**
         * add node
         * @param {string} chars key
         * @param {string} id    id
         * @public
         */
        add: function (chars, id) {
            var parent = this.root;
            var length = chars ? chars.length : 0;
            var node;
            for (var i = 0; i < length; i++) {
                var char = chars[i];
                node = parent.n[char];
                if (node) {
                    parent = node;
                }
                else {
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
        /**
         * get the id array by key
         * @param {string} chars key
         * @param {string} id    id
         * @return {Array} id    array
         * @public
         */
        get: function (chars) {
            var parent = this.root;
            var length = chars ? chars.length : 0;
            var node;
            for (var i = 0; i < length; i++) {
                node = parent.n[chars[i]];
                if (node) {
                    parent = node;
                }
                else {
                    return [];
                }
            }
            return parent.i;
        },
        /**
         * remove node
         * @param {string} chars key
         * @param {string} id    id
         * @return {boolean} if the node exist
         * @public
         */
        remove: function (chars, id) {
            var parent = this.root;
            var length = chars ? chars.length : 0;
            var node;
            for (var i = 0; i < length; i++) {
                node = parent.n[chars[i]];
                if (node) {
                    parent = node;
                } else {
                    // there is no same chars
                    return false;
                }
            }
            var index = parent.i.indexOf(id);
            if (index === -1) {
                // there is no same id
                return false;
            }
            // only need remove the first same id
            parent.i.splice(index, 1);

            if (parent.i.length === 0 && Object.keys(parent.n).length === 0 && length > 0) {
                var lastEndNode = this.root;
                var lastChildKey = chars[0];
                parent = this.root;
                for (i = 0; i < length; i++) {
                    node = parent.n[chars[i]];
                    if (node.i.length > 0 || Object.keys(node.n).length > 1) {
                        lastEndNode = node;
                        lastChildKey = chars[i + 1];
                    }
                    parent = node;
                }
                delete lastEndNode.n[lastChildKey];
            }
            return true;
        },
        /**
         * update node
         * @param {string} oldChars old key
         * @param {string} newChars new key
         * @param {string} id    id
         * @public
         */
        update: function (oldChars, newChars, id) {
            this.remove(oldChars, id);
            this.add(newChars, id);
        }
    };
    return TrieTree;
});

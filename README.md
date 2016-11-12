# OrangeTree
Access, modify(copy-on-change) JavaScript object trees.

[![travis-ci.org](https://travis-ci.org/walnutgeek/OrangeTree.svg?branch=master)](https://travis-ci.org/walnutgeek/OrangeTree)
[![codecov.io](https://codecov.io/github/walnutgeek/OrangeTree/coverage.svg?branch=master)](https://codecov.io/github/walnutgeek/OrangeTree?branch=master)
[![npm version](https://badge.fury.io/js/OrangeTree.svg)](https://www.npmjs.com/package/OrangeTree)
[![npm downloads](https://img.shields.io/npm/dm/OrangeTree.svg)](https://npmjs.org/package/OrangeTree)
[![Dependency Status](https://gemnasium.com/walnutgeek/OrangeTree.svg)](https://gemnasium.com/walnutgeek/OrangeTree)

Orange trees can have fruits and flowers at the same time. 
OrangeTree project helps to modify object tree without mutation 
of original input. API use plain objects and arrays to store data. 
As modificaion applied to the tree API has to all clone tree nodes from 
point of change to root of the tree to hold new changes while preserving
original state immutable. To avoid unnecessary copies, it keeps track 
what nodes are already cloned in parallel tree structure.

JSON Pointer is used to refer to particular location
in object tree. Rather then mutate object tree, API
recreates branches keeping previous state immutable.

JSON Pointer implemented according RFC-6901 spec with little additon.
In RFC you can use positive number in path to refer particular element
of array, also you can use `-` to indicate new element of array to be
created. This implementation make use of negative numbers to refer
elements from the end of array. Such as `-1` means last element, `-2` -
second from the end, and so forth ...

See:
[RFC 6901 - JavaScript Object Notation (JSON) Pointer - IETF Tools](https://tools.ietf.org/html/rfc6901)

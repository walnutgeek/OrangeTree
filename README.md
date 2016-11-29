# OrangeTree
Access, modify(copy-on-change) JavaScript object trees.

[![travis-ci.org](https://travis-ci.org/walnutgeek/OrangeTree.svg?branch=master)](https://travis-ci.org/walnutgeek/OrangeTree)
[![appveyor.com](https://ci.appveyor.com/api/projects/status/github/walnutgeek/orangetree?svg=true)](https://ci.appveyor.com/project/walnutgeek/orangetree)
[![codecov.io](https://codecov.io/github/walnutgeek/OrangeTree/coverage.svg?branch=master)](https://codecov.io/github/walnutgeek/OrangeTree?branch=master)
[![npm version](https://badge.fury.io/js/OrangeTree.svg)](https://www.npmjs.com/package/OrangeTree)
[![npm downloads](https://img.shields.io/npm/dm/OrangeTree.svg)](https://npmjs.org/package/OrangeTree)
[![Dependency Status](https://gemnasium.com/walnutgeek/OrangeTree.svg)](https://gemnasium.com/walnutgeek/OrangeTree)

Orange trees can have fruits and flowers at the same time. 
OrangeTree project helps to modify object tree without mutation 
of original input. API use plain objects and arrays to store data. 
As modificaion applied to the tree, logic clones tree nodes from 
point of change to root of the tree to hold new changes while preserving
original input immutable. To avoid unnecessary copies, it keeps track 
what nodes are already cloned in parallel `Shadow` tree structure.

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

## Use

```
> var Shadow = require('OrangeTree').Shadow ;

> var init_state = { a: 'a', x: [3,2] } ;
> var ot = new Shadow( init ) ;

> ot.get('/x/-1') //last element in array 'x'
  2

> var path = ot.set('/x/-',1) // add element to end of array 'x'
> path.toString() // absolute path to element that was added
/x/2

> ot.value()
{"a":"a","x":[3,2,1]}

```
## Validations


### Types

#### Primitive 
  * boolean
  * number
  * string
  * date
  * datetime
  * timestamp
  
#### Containers
  * array - assumes all elements of same types specified by `valueType`
  * map - object where keys are string representation of `keyType` (via
    `toString()`). values are all of `valueType`
  * object - object structure defined by `fields` object that map 
    
### Complex Types
  * link
  * table
  
### Constraints

Constrant is function returning boolean with signature  
`fn(value, shadow, abs_path)`

#### Pre-defined constraints
   * `maxLength(sz)`
   * `minLength(sz)`
   * `float`
   * `integer`
   * `uint`
   * `uint32`
   * `max_value(v)`
   


